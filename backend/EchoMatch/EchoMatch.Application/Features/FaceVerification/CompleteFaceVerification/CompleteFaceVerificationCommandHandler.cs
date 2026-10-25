using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.FaceVerification.CompleteFaceVerification
{
    public class CompleteFaceVerificationCommandHandler
        : IRequestHandler<CompleteFaceVerificationCommand, FaceVerificationResultDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IFaceVerificationService _faceVerificationService;
        private readonly ICurrentUserService _currentUserService;

        public CompleteFaceVerificationCommandHandler(
            IProfileRepository profileRepository,
            IFaceVerificationService faceVerificationService,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _faceVerificationService = faceVerificationService;
            _currentUserService = currentUserService;
        }

        public async Task<FaceVerificationResultDto> Handle(
            CompleteFaceVerificationCommand request,
            CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdWithPhotosAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            // Чужа, вже використана або замінена новою сесія
            if (profile.FaceLivenessSessionId is null || profile.FaceLivenessSessionId != request.SessionId)
            {
                throw new NotFoundException("Сесію перевірки не знайдено — почніть заново.");
            }

            var liveness = await _faceVerificationService
                .GetLivenessResultAsync(request.SessionId!, cancellationToken);

            // Сесію ще не закрито: її можна запитати знову, тож не позначаємо
            // використаною
            if (liveness.Status == FaceLivenessStatus.InProgress)
            {
                throw new ConflictException("Перевірка ще триває — спробуйте за мить.");
            }

            // Фото беремо на момент завершення, а не старту: між ними людина
            // могла щось додати чи видалити
            var photosToCheck = profile.Photos
                .Where(photo => !photo.IsFaceVerified)
                .OrderBy(photo => photo.Order)
                .ToList();

            var (status, checks) = await EvaluateAsync(liveness, photosToCheck, cancellationToken);

            var matchedPhotoIds = checks
                .Where(check => check.Match == PhotoFaceMatch.Verified)
                .Select(check => check.PhotoId)
                .ToList();

            profile.CompleteFaceVerification(matchedPhotoIds, DateTime.UtcNow);

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return new FaceVerificationResultDto(status, liveness.Confidence, profile.IsFaceVerified, checks);
        }

        private async Task<(FaceVerificationStatus Status, IReadOnlyList<PhotoFaceCheckDto> Checks)> EvaluateAsync(
            FaceLivenessResult liveness,
            IReadOnlyList<Photo> photos,
            CancellationToken cancellationToken)
        {
            if (liveness.Status == FaceLivenessStatus.Expired)
            {
                return (FaceVerificationStatus.Expired, Array.Empty<PhotoFaceCheckDto>());
            }

            if (liveness.Status != FaceLivenessStatus.Succeeded
                || liveness.Confidence < FaceVerificationThresholds.MinLivenessConfidence
                || liveness.ReferenceImage is null)
            {
                return (FaceVerificationStatus.NotLive, Array.Empty<PhotoFaceCheckDto>());
            }

            // Порівнюємо лише тоді, коли вже ясно, що перед камерою жива людина:
            // інакше збіг з фото нічого б не доводив. По черзі, а не разом:
            // фото не більше дев'яти, а AWS обмежує кількість викликів за секунду
            var checks = new List<PhotoFaceCheckDto>();

            foreach (var photo in photos)
            {
                var similarity = await _faceVerificationService
                    .CompareWithPhotoAsync(liveness.ReferenceImage, photo.Url, cancellationToken);

                var match = similarity switch
                {
                    null => PhotoFaceMatch.NoFace,
                    < FaceVerificationThresholds.MinFaceSimilarity => PhotoFaceMatch.FaceMismatch,
                    _ => PhotoFaceMatch.Verified
                };

                checks.Add(new PhotoFaceCheckDto(photo.Id, match, similarity));
            }

            return (FaceVerificationStatus.Completed, checks);
        }
    }
}