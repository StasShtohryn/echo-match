using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.UpdateVisibility
{
    public class UpdateVisibilityCommandHandler : IRequestHandler<UpdateVisibilityCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ICurrentUserService _currentUserService;

        public UpdateVisibilityCommandHandler(
            IProfileRepository profileRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(UpdateVisibilityCommand request, CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            profile.IsPrivate = request.IsPrivate!.Value;

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}