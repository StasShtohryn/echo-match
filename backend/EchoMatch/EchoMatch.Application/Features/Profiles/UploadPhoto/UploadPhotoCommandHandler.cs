

using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.UploadPhoto
{
    public class UploadPhotoCommandHandler : IRequestHandler<UploadPhotoCommand, PhotoDto>
    {
        private const int MaxPhotos = 9;

        private readonly IProfileRepository _profileRepository;
        private readonly IPhotoStorage _photoStorage;
        private readonly ICurrentUserService _currentUserService;

        public UploadPhotoCommandHandler(
            IProfileRepository profileRepository,
            IPhotoStorage photoStorage,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _photoStorage = photoStorage;
            _currentUserService = currentUserService;
        }

        public async Task<PhotoDto> Handle(UploadPhotoCommand request, CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdWithPhotosAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            if (profile.Photos.Count >= MaxPhotos)
            {
                throw new ConflictException($"Можна завантажити щонайбільше {MaxPhotos} фото.");
            }

            var uploaded = await _photoStorage.UploadAsync(request.Content, request.FileName, cancellationToken);

            var photo = new Photo
            {
                UserProfileId = profile.Id,
                Url = uploaded.Url,
                PublicId = uploaded.PublicId,
                Order = profile.Photos.Count,
                IsMain = profile.Photos.Count == 0
            };

            profile.Photos.Add(photo);

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return new PhotoDto(photo.Id, photo.Url, photo.IsMain, photo.Order);
        }
    }
}
