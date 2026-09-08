using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.SetLanguages
{
    public class SetLanguagesCommandHandler
    : IRequestHandler<SetLanguagesCommand, IReadOnlyList<LookupItemDto>>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ILookupRepository _lookupRepository;
        private readonly ICurrentUserService _currentUserService;

        public SetLanguagesCommandHandler(
            IProfileRepository profileRepository,
            ILookupRepository lookupRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _lookupRepository = lookupRepository;
            _currentUserService = currentUserService;
        }

        public async Task<IReadOnlyList<LookupItemDto>> Handle(
            SetLanguagesCommand request,
            CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdWithLanguagesAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var available = (await _lookupRepository.GetActiveLanguagesAsync(cancellationToken))
                .ToDictionary(language => language.Id);
            var unknown = request.LanguageIds.Where(id => !available.ContainsKey(id)).ToList();

            if (unknown.Count > 0)
            {
                throw new NotFoundException($"Невідомі мови: {string.Join(", ", unknown)}");
            }

            profile.Languages.Clear();

            foreach (var languageId in request.LanguageIds)
            {
                profile.Languages.Add(new UserLanguage { LanguageId = languageId });
            }

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return request.LanguageIds
                .Select(id => new LookupItemDto(id, available[id].Code, available[id].Name))
                .ToList();
        }
    }
}
