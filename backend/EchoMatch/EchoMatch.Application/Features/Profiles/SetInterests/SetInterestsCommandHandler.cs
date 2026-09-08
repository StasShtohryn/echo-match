using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using MediatR;


namespace EchoMatch.Application.Features.Profiles.SetInterests
{
    public class SetInterestsCommandHandler
    : IRequestHandler<SetInterestsCommand, IReadOnlyList<LookupItemDto>>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ILookupRepository _lookupRepository;
        private readonly ICurrentUserService _currentUserService;

        public SetInterestsCommandHandler(
            IProfileRepository profileRepository,
            ILookupRepository lookupRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _lookupRepository = lookupRepository;
            _currentUserService = currentUserService;
        }

        public async Task<IReadOnlyList<LookupItemDto>> Handle(
            SetInterestsCommand request,
            CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdWithInterestsAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var available = (await _lookupRepository.GetActiveInterestsAsync(cancellationToken))
                .ToDictionary(interest => interest.Id);

            var unknown = request.InterestIds.Where(id => !available.ContainsKey(id)).ToList();

            if (unknown.Count > 0)
            {
                throw new NotFoundException($"Невідомі інтереси: {string.Join(", ", unknown)}");
            }

            profile.Interests.Clear();

            foreach (var interestId in request.InterestIds)
            {
                profile.Interests.Add(new UserInterest { InterestId = interestId });
            }

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return request.InterestIds
                .Select(id => new LookupItemDto(id, available[id].Code, available[id].Name))
                .ToList();
        }
    }
}
