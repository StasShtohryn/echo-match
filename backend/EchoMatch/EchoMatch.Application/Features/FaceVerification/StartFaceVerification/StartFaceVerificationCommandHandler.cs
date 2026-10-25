using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.FaceVerification.StartFaceVerification
{
    public class StartFaceVerificationCommandHandler
        : IRequestHandler<StartFaceVerificationCommand, FaceVerificationSessionDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IFaceVerificationService _faceVerificationService;
        private readonly ICurrentUserService _currentUserService;

        public StartFaceVerificationCommandHandler(
            IProfileRepository profileRepository,
            IFaceVerificationService faceVerificationService,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _faceVerificationService = faceVerificationService;
            _currentUserService = currentUserService;
        }

        public async Task<FaceVerificationSessionDto> Handle(
            StartFaceVerificationCommand request,
            CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdWithPhotosAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            // Без фото перевіряти нема з чим: «жива людина» сама по собі ще
            // не каже, що це саме вона на фото в профілі
            if (profile.Photos.Count == 0)
            {
                throw new ConflictException("Спершу додайте фото: обличчя порівнюватиметься з ними.");
            }

            if (profile.Photos.All(photo => photo.IsFaceVerified))
            {
                throw new ConflictException("Усі фото вже перевірено.");
            }

            var sessionId = await _faceVerificationService.CreateSessionAsync(cancellationToken);

            // Нова сесія замінює незавершену попередню: та вже не знадобиться
            profile.StartFaceVerification(sessionId);

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return new FaceVerificationSessionDto(sessionId, _faceVerificationService.Region);
        }
    }
}