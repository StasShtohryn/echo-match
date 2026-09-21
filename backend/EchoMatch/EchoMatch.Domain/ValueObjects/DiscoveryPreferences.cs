

using EchoMatch.Domain.Enums;

namespace EchoMatch.Domain.ValueObjects
{
    public class DiscoveryPreferences
    {
        public const int MinAllowedAge = 18;
        public const int MaxAllowedAge = 99;
        public const int MinAllowedDistanceKm = 1;
        public const int MaxAllowedDistanceKm = 160;

        public InterestedIn ShowMe { get; private set; }
        public int MinAge { get; private set; }
        public int MaxAge { get; private set; }

        // null — без обмеження відстані
        public int? MaxDistanceKm { get; private set; }

        private DiscoveryPreferences() { }

        public DiscoveryPreferences(InterestedIn showMe, int minAge, int maxAge, int? maxDistanceKm)
        {
            if (!Enum.IsDefined(showMe))
            {
                throw new ArgumentOutOfRangeException(nameof(showMe), "Unknown ShowMe value.");
            }

            if (minAge is < MinAllowedAge or > MaxAllowedAge)
            {
                throw new ArgumentOutOfRangeException(nameof(minAge), $"MinAge must be between {MinAllowedAge} and {MaxAllowedAge}.");
            }

            if (maxAge < minAge || maxAge > MaxAllowedAge)
            {
                throw new ArgumentOutOfRangeException(nameof(maxAge), $"MaxAge must be between MinAge and {MaxAllowedAge}.");
            }

            if (maxDistanceKm is < MinAllowedDistanceKm or > MaxAllowedDistanceKm)
            {
                throw new ArgumentOutOfRangeException(nameof(maxDistanceKm), $"MaxDistanceKm must be between {MinAllowedDistanceKm} and {MaxAllowedDistanceKm}.");
            }

            ShowMe = showMe;
            MinAge = minAge;
            MaxAge = maxAge;
            MaxDistanceKm = maxDistanceKm;
        }


        public IReadOnlyList<Gender> AcceptedGenders() => ShowMe switch
        {
            InterestedIn.Men => [Gender.Male],
            InterestedIn.Women => [Gender.Female],
            _ => [Gender.Male, Gender.Female, Gender.Other]
        };

        // Значення ShowMe інших людей, які означають «хочу бачити таку стать»
        public static IReadOnlyList<InterestedIn> ShowMeValuesAccepting(Gender gender) => gender switch
        {
            Gender.Male => [InterestedIn.Men, InterestedIn.Everyone],
            Gender.Female => [InterestedIn.Women, InterestedIn.Everyone],
            _ => [InterestedIn.Everyone]
        };

        // Вік у базі не зберігається, тож віковий діапазон перекладається
        // у межі дати народження, за якими база вміє фільтрувати
        public (DateOnly Earliest, DateOnly Latest) BirthDateRange(DateOnly today) =>
            (today.AddYears(-(MaxAge + 1)).AddDays(1), today.AddYears(-MinAge));

        // Відстань симетрична, тож діє менший із двох лімітів; null — без обмеження
        public int? EffectiveDistanceLimit(int? otherLimitKm) => (MaxDistanceKm, otherLimitKm) switch
        {
            (null, null) => null,
            (null, var other) => other,
            (var mine, null) => mine,
            (var mine, var other) => Math.Min(mine.Value, other!.Value)
        };
    }
}
