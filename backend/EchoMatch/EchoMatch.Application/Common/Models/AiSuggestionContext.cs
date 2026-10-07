using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Common.Models
{
    // Що саме їде до моделі. Координат і дати народження тут немає навмисно:
    // вони не є вмістом профілю й нікому не показуються
    public record AiPartnerContext(
        string DisplayName,
        int Age,
        string? City,
        string? Bio,
        string? Occupation,
        string? LookingFor,
        IReadOnlyList<string> Interests,
        IReadOnlyList<string> Languages,
        IReadOnlyList<(string Question, string Answer)> PromptAnswers);

    public record AiHistoryMessage(bool IsMine, string Text);

    public record AiSuggestionContext(
        AiSuggestionKind Kind,
        MessageTone? Tone,
        string? Draft,
        string MyDisplayName,
        AiPartnerContext Partner,
        IReadOnlyList<AiHistoryMessage> History);
}