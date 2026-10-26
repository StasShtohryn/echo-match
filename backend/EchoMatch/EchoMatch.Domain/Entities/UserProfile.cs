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
        public string? City { get; set; }
        public string? Bio { get; set; }
        public string? Occupation { get; set; }
        public string? Company { get; set; }
        public string? School { get; set; }
        public int? HeightCm { get; set; }

        // Пошук
        public RelationshipGoal? LookingFor { get; set; }
        public DiscoveryPreferences? Preferences { get; set; }

        // Спосіб життя
        public FamilyPlan? FamilyPlans { get; set; }
        public CommunicationStyle? Communication { get; set; }
        public LoveStyle? LoveLanguage { get; set; }
        public List<PetPreference> Pets { get; set; } = new();
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
        public DateTime? LastActiveAt { get; set; }

        // Сесія перевірки обличчя, яку людина зараз проходить. Прив'язка до
        // профілю не дає завершити чужу сесію, знаючи лише її id
        public string? FaceLivenessSessionId { get; private set; }

        // Один опис готовності профілю: і для фільтра стрічки, і для підказки,
        // чого саме бракує. Порядок — від найпершого, що треба виправити.
        public ProfileReadiness Readiness =>
            IsPrivate ? ProfileReadiness.Hidden
            : Photos.Count == 0 ? ProfileReadiness.PhotoRequired
            : Preferences is null ? ProfileReadiness.PreferencesRequired
            : ProfileReadiness.Ready;

        public bool IsDiscoverable => Readiness == ProfileReadiness.Ready;

        // Значок профілю — це перевірене головне фото. Окремо не зберігається:
        // нове головне фото чи видалення перевіреного одразу змінює і значок
        public bool IsFaceVerified => Photos.Any(photo => photo.IsMain && photo.IsFaceVerified);


        public void StartFaceVerification(string sessionId)
        {
            FaceLivenessSessionId = sessionId;
        }

        // Сесія одноразова: і успіх, і невдача її закривають. Фото, що не
        // збіглися, лишаються як були — невдала спроба не знімає вже наявної
        // позначки, це не нове свідчення проти неї
        public void CompleteFaceVerification(IReadOnlyCollection<Guid> matchedPhotoIds, DateTime utcNow)
        {
            FaceLivenessSessionId = null;

            foreach (var photo in Photos.Where(photo => matchedPhotoIds.Contains(photo.Id)))
            {
                photo.MarkFaceVerified(utcNow);
            }
        }

        // Зв'язки
        public ICollection<Photo> Photos { get; set; } = new List<Photo>();
        public ICollection<UserInterest> Interests { get; set; } = new List<UserInterest>();
        public ICollection<UserLanguage> Languages { get; set; } = new List<UserLanguage>();
        public ICollection<ProfilePromptAnswer> PromptAnswers { get; set; } = new List<ProfilePromptAnswer>();

        public int Age => AgeOn(DateOfBirth, DateOnly.FromDateTime(DateTime.UtcNow));

        // Статичний, щоб рахувати вік і там, де під рукою лише дата народження,
        // а не весь профіль — наприклад, у списку метчів
        public static int AgeOn(DateOnly dateOfBirth, DateOnly today)
        {
            var age = today.Year - dateOfBirth.Year;

            if (dateOfBirth > today.AddYears(-age))
            {
                age--;
            }

            return age;
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
