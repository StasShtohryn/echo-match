using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Matches.GetCompatibility
{
    public class GetMatchCompatibilityQueryHandler
        : IRequestHandler<GetMatchCompatibilityQuery, MatchCompatibilityDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IAiAssistant _aiAssistant;
        private readonly ICurrentUserService _currentUserService;

        public GetMatchCompatibilityQueryHandler(
            IProfileRepository profileRepository,
            IMatchRepository matchRepository,
            IAiAssistant aiAssistant,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _matchRepository = matchRepository;
            _aiAssistant = aiAssistant;
            _currentUserService = currentUserService;
        }

        public async Task<MatchCompatibilityDto> Handle(
            GetMatchCompatibilityQuery request,
            CancellationToken cancellationToken)
        {
            var me = await _profileRepository
                .GetByUserIdWithDetailsAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var match = await _matchRepository
                .GetForParticipantAsync(request.MatchId, me.Id, cancellationToken)
                ?? throw new NotFoundException("Метч не знайдено.");

            var partner = await _profileRepository
                .GetByIdWithDetailsAsync(match.OtherProfileId(me.Id), cancellationToken)
                ?? throw new NotFoundException("Співрозмовника не знайдено.");

            var sharedInterests = Shared(
                me.Interests.Select(link => (link.InterestId, link.Interest.Name)),
                partner.Interests.Select(link => (link.InterestId, link.Interest.Name)));

            var sharedLanguages = Shared(
                me.Languages.Select(link => (link.LanguageId, link.Language.Name)),
                partner.Languages.Select(link => (link.LanguageId, link.Language.Name)));

            var sharedGoal = me.LookingFor is { } mine && mine == partner.LookingFor
                ? mine.ToString()
                : null;

            // Те саме правило, що у стрічці: цілі кілометри й ніколи менше одного,
            // щоб із відстані не можна було відтворити адресу
            int? distanceKm = me.Location is { } here && partner.Location is { } there
                ? (int)Math.Max(1, Math.Ceiling(here.DistanceKmTo(there)))
                : null;

            // Фраза генерується один раз на метч: обом показується та сама,
            // і повторні відкриття екрана нічого не коштують
            if (match.CompatibilitySummary is null)
            {
                var summary = await _aiAssistant.SummariseCompatibilityAsync(
                    new AiCompatibilityContext(
                        me.DisplayName,
                        partner.DisplayName,
                        sharedInterests,
                        sharedLanguages,
                        sharedGoal,
                        distanceKm),
                    cancellationToken);

                match.SetCompatibilitySummary(summary);
                await _matchRepository.SaveChangesAsync(cancellationToken);
            }

            return new MatchCompatibilityDto(
                sharedInterests,
                sharedLanguages,
                sharedGoal,
                distanceKm,
                match.CompatibilitySummary);
        }

        private static IReadOnlyList<string> Shared(
            IEnumerable<(int Id, string Name)> mine,
            IEnumerable<(int Id, string Name)> theirs)
        {
            var theirIds = theirs.Select(item => item.Id).ToHashSet();

            return mine
                .Where(item => theirIds.Contains(item.Id))
                .Select(item => item.Name)
                .OrderBy(name => name)
                .ToList();
        }
    }
}