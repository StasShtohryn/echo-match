

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
    }
}
