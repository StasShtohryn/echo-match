using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.SetMainPhoto;

public class SetMainPhotoCommandHandler : IRequestHandler<SetMainPhotoCommand, Unit>
{
    private readonly IProfileRepository _profileRepository;
    private readonly ICurrentUserService _currentUserService;

    public SetMainPhotoCommandHandler(
        IProfileRepository profileRepository,
        ICurrentUserService currentUserService)
    {
        _profileRepository = profileRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(SetMainPhotoCommand request, CancellationToken cancellationToken)
    {
        var profile = await _profileRepository
            .GetByUserIdWithPhotosAsync(_currentUserService.UserId, cancellationToken)
            ?? throw new NotFoundException("Профіль ще не створено.");

        var photo = profile.Photos.FirstOrDefault(p => p.Id == request.PhotoId)
            ?? throw new NotFoundException("Фото не знайдено.");

        foreach (var existing in profile.Photos)
        {
            existing.IsMain = false;
        }

        photo.IsMain = true;

        await _profileRepository.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}