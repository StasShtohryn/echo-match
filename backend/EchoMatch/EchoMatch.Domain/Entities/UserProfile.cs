using EchoMatch.Domain.Common;
using EchoMatch.Domain.Enums;
using EchoMatch.Domain.ValueObjects;

namespace EchoMatch.Domain.Entities
{
    public class UserProfile : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // Обов'язкові
        public string DisplayName { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public Gender Gender { get; set; }

        // Про себе
        public SexualOrientation? Orientation { get; set; }
        public string? Bio { get; set; }
        public string? Occupation { get; set; }
        public string? Company { get; set; }
        public string? School { get; set; }
        public int? HeightCm { get; set; }

        // Пошук
        public InterestedIn? ShowMe { get; set; }
        public RelationshipGoal? LookingFor { get; set; }

        // Спосіб життя
        public FamilyPlan? FamilyPlans { get; set; }
        public CommunicationStyle? Communication { get; set; }
        public LoveStyle? LoveLanguage { get; set; }
        public PetPreference? Pets { get; set; }
        public DrinkingHabit? Drinking { get; set; }
        public SmokingHabit? Smoking { get; set; }
        public WorkoutHabit? Workout { get; set; }

        // Соцмережі
        public string? InstagramHandle { get; set; }
        public string? SpotifyHandle { get; set; }

        // Локація
        public GeoLocation? Location { get; set; }
        public DateTime? LastLocationUpdatedAt { get; set; }

        // Стан
        public bool IsPrivate { get; set; }
        public bool IsFaceVerified { get; set; }
        public DateTime? LastActiveAt { get; set; }

        // Зв'язки
        public ICollection<Photo> Photos { get; set; } = new List<Photo>();
        public ICollection<UserInterest> Interests { get; set; } = new List<UserInterest>();
        public ICollection<UserLanguage> Languages { get; set; } = new List<UserLanguage>();
        public ICollection<ProfilePromptAnswer> PromptAnswers { get; set; } = new List<ProfilePromptAnswer>();

        // Обчислювані — у БД не зберігаються
        public int Age
        {
            get
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var age = today.Year - DateOfBirth.Year;

                if (DateOfBirth > today.AddYears(-age))
                {
                    age--;
                }

                return age;
            }
        }

        public ZodiacSign Zodiac => CalculateZodiac(DateOfBirth);

        private static ZodiacSign CalculateZodiac(DateOnly date) => (date.Month, date.Day) switch
        {
            (1, <= 19) => ZodiacSign.Capricorn,
            (1, _) => ZodiacSign.Aquarius,
            (2, <= 18) => ZodiacSign.Aquarius,
            (2, _) => ZodiacSign.Pisces,
            (3, <= 20) => ZodiacSign.Pisces,
            (3, _) => ZodiacSign.Aries,
            (4, <= 19) => ZodiacSign.Aries,
            (4, _) => ZodiacSign.Taurus,
            (5, <= 20) => ZodiacSign.Taurus,
            (5, _) => ZodiacSign.Gemini,
            (6, <= 20) => ZodiacSign.Gemini,
            (6, _) => ZodiacSign.Cancer,
            (7, <= 22) => ZodiacSign.Cancer,
            (7, _) => ZodiacSign.Leo,
            (8, <= 22) => ZodiacSign.Leo,
            (8, _) => ZodiacSign.Virgo,
            (9, <= 22) => ZodiacSign.Virgo,
            (9, _) => ZodiacSign.Libra,
            (10, <= 22) => ZodiacSign.Libra,
            (10, _) => ZodiacSign.Scorpio,
            (11, <= 21) => ZodiacSign.Scorpio,
            (11, _) => ZodiacSign.Sagittarius,
            (12, <= 21) => ZodiacSign.Sagittarius,
            _ => ZodiacSign.Capricorn
        };
    }
}
