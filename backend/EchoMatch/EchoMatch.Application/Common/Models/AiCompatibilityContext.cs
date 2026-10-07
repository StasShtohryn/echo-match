namespace EchoMatch.Application.Common.Models
{
    // Для фрази потрібні лише перетини, які ми вже порахували самі: модель
    // нічого не оцінює й нічого не вигадує, вона лише формулює
    public record AiCompatibilityContext(
        string MyDisplayName,
        string PartnerDisplayName,
        IReadOnlyList<string> SharedInterests,
        IReadOnlyList<string> SharedLanguages,
        string? SharedGoal,
        int? DistanceKm);
}