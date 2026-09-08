

using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.DeletePhoto
{
    public class DeletePhotoCommandHandler : IRequestHandler<DeletePhotoCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IPhotoStorage _photoStorage;
        private readonly ICurrentUserService _currentUserService;

        public DeletePhotoCommandHandler(
            IProfileRepository profileRepository,
            IPhotoStorage photoStorage,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _photoStorage = photoStorage;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(DeletePhotoCommand request, CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdWithPhotosAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var photo = profile.Photos.FirstOrDefault(p => p.Id == request.PhotoId)
                ?? throw new NotFoundException("Фото не знайдено.");

            var wasMain = photo.IsMain;

            await _photoStorage.DeleteAsync(photo.PublicId, cancellationToken);

            profile.Photos.Remove(photo);

            var remaining = profile.Photos.OrderBy(p => p.Order).ToList();

            for (var index = 0; index < remaining.Count; index++)
            {
                remaining[index].Order = index;
            }

            if (wasMain && remaining.Count > 0)
            {
                remaining[0].IsMain = true;
            }

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
