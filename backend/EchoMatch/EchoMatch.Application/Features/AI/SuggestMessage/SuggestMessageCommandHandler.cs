using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Ai.SuggestMessage
{
    public class SuggestMessageCommandHandler : IRequestHandler<SuggestMessageCommand, AiSuggestionsDto>
    {
        // Скільком повідомленням історії дозволено поїхати до моделі
        private const int HistoryLimit = 50;

        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IAiAssistant _aiAssistant;
        private readonly ICurrentUserService _currentUserService;

        public SuggestMessageCommandHandler(
            IProfileRepository profileRepository,
            IMatchRepository matchRepository,
            IMessageRepository messageRepository,
            IAiAssistant aiAssistant,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _matchRepository = matchRepository;
            _messageRepository = messageRepository;
            _aiAssistant = aiAssistant;
            _currentUserService = currentUserService;
        }

        public async Task<AiSuggestionsDto> Handle(
            SuggestMessageCommand request,
            CancellationToken cancellationToken)
        {
            var me = await _profileRepository
                .GetByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var match = await _matchRepository
                .GetForParticipantAsync(request.MatchId, me.Id, cancellationToken)
                ?? throw new NotFoundException("Метч не знайдено.");

            var partner = await _profileRepository
                .GetByIdWithDetailsAsync(match.OtherProfileId(me.Id), cancellationToken)
                ?? throw new NotFoundException("Співрозмовника не знайдено.");

            var page = await _messageRepository
                .GetPageAsync(request.MatchId, me.Id, null, HistoryLimit, cancellationToken);

            // Репозиторій віддає від новіших до старіших, а модель читає розмову
            // як людина — від початку
            var history = page
                .Reverse()
                .Select(m => new AiHistoryMessage(m.SenderProfileId == me.Id, m.Text))
                .ToList();

            var context = new AiSuggestionContext(
                request.Kind!.Value,
                request.Tone,
                request.Draft?.Trim(),
                me.DisplayName,
                ToPartnerContext(partner),
                history);

            var suggestions = await _aiAssistant.SuggestAsync(context, cancellationToken);

            return new AiSuggestionsDto(suggestions);
        }

        private static AiPartnerContext ToPartnerContext(UserProfile partner)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            return new AiPartnerContext(
                partner.DisplayName,
                UserProfile.AgeOn(partner.DateOfBirth, today),
                partner.City,
                partner.Bio,
                partner.Occupation,
                partner.LookingFor?.ToString(),
                partner.Interests.Select(link => link.Interest.Name).ToList(),
                partner.Languages.Select(link => link.Language.Name).ToList(),
                partner.PromptAnswers
                    .OrderBy(answer => answer.Order)
                    .Select(answer => (answer.ProfilePrompt.Question, answer.Answer))
                    .ToList());
        }
    }
}