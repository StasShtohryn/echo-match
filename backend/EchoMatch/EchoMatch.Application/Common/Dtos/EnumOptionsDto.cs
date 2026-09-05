

namespace EchoMatch.Application.Common.Dtos
{
    public record EnumOptionsDto
    {
        public required IReadOnlyList<string> Gender { get; init; }
        public required IReadOnlyList<string> Orientation { get; init; }
        public required IReadOnlyList<string> ShowMe { get; init; }
        public required IReadOnlyList<string> LookingFor { get; init; }
        public required IReadOnlyList<string> FamilyPlans { get; init; }
        public required IReadOnlyList<string> Communication { get; init; }
        public required IReadOnlyList<string> LoveLanguage { get; init; }
        public required IReadOnlyList<string> Pets { get; init; }
        public required IReadOnlyList<string> Drinking { get; init; }
        public required IReadOnlyList<string> Smoking { get; init; }
        public required IReadOnlyList<string> Workout { get; init; }
    }
}
