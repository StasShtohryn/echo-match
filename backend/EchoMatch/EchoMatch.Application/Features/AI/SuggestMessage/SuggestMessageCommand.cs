using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Features.Ai.SuggestMessage
{
    // Тіло запиту: метч приходить з маршруту
    public record SuggestMessageRequest(AiSuggestionKind? Kind, MessageTone? Tone, string? Draft);

    // Kind nullable: пропущене поле інакше прочиталося б як FirstMessage
    public record SuggestMessageCommand(
        Guid MatchId,
        AiSuggestionKind? Kind,
        MessageTone? Tone,
        string? Draft) : ICommand<AiSuggestionsDto>;
}