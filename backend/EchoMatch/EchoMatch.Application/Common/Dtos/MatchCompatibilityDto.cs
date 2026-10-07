namespace EchoMatch.Application.Common.Dtos
{
    // Відсоток сумісності рахує клієнт за своїм алгоритмом — тут лише факти
    // перетину й одна фраза, згенерована з них
    public record MatchCompatibilityDto(
        IReadOnlyList<string> SharedInterests,
        IReadOnlyList<string> SharedLanguages,
        string? SharedGoal,
        int? DistanceKm,
        string? Summary);
}