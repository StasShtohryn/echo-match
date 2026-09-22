using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;
using EchoMatch.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace EchoMatch.Infrastructure.Persistence
{
    public sealed record DevSeedResult(
        int Created,
        int LikesGiven,
        string Password,
        IReadOnlyList<string> SampleLogins,
        string? Note);

    // Тестові дані для розробки. Поки застосунок не запущено для людей, ендпоінти
    // відкриті без входу — перед запуском їх треба прибрати разом із публічним Swagger.
    public sealed class DevDataSeeder
    {
        public const string EmailDomain = "@seed.local";
        public const string Password = "Seed1234!";

        // Скільки профілів підганяються під запрошеного й одразу його лайкають
        private const int TailoredLikes = 5;

        private static readonly string[] FemaleNames =
        [
            "Оксана", "Катерина", "Марія", "Софія", "Ірина", "Юлія", "Анна", "Дарина",
            "Вікторія", "Олена", "Наталія", "Христина", "Богдана", "Злата", "Мирослава",
            "Соломія", "Уляна", "Ярина", "Леся", "Тетяна", "Аліна", "Валерія",
            "Анастасія", "Ольга", "Руслана"
        ];

        private static readonly string[] MaleNames =
        [
            "Андрій", "Олег", "Тарас", "Максим", "Дмитро", "Назар", "Богдан", "Остап",
            "Василь", "Юрій", "Сергій", "Роман", "Артем", "Ігор", "Павло",
            "Микола", "Степан", "Віктор", "Денис", "Владислав", "Ростислав", "Любомир",
            "Орест", "Марко", "Данило"
        ];

        private static readonly string[] Bios =
        [
            "Кава, велосипед і гори. Саме в такому порядку.",
            "Шукаю того, з ким можна помовчати.",
            "Готую краще, ніж здається. Перевіримо?",
            "Навесні біжу марафон. Компанія не завадить.",
            "Люблю старі фільми й нові міста.",
            "Волонтерю щосереди, решту часу пишу код.",
            "Можу говорити про книжки годинами.",
            "Третій рік танцюю сальсу.",
            "Фотографую на плівку і сам проявляю.",
            "Дощ, чай і довгі розмови."
        ];

        private static readonly string[] Occupations =
        [
            "Дизайнер", "Розробник", "Лікар", "Вчитель", "Архітектор",
            "Барист", "Юрист", "Інженер", "Маркетолог", "Фізіотерапевт"
        ];

        private static readonly string[] Companies =
        [
            "Rozetka", "монобанк", "Netpeak", "Сільпо", "власна справа", "Ajax Systems"
        ];

        private static readonly string[] Schools =
        [
            "КПІ", "КНУ імені Шевченка", "НаУКМА", "ЛНУ імені Франка", "ХНУРЕ"
        ];

        private static readonly string[] Answers =
        [
            "Найкраще цього року — переїзд ближче до парку.",
            "Пам'ятаю номери всіх маршруток, якими їздив у дитинстві.",
            "Ідеальна неділя — ринок, кава й жодних планів.",
            "Ніколи не відмовлюся від морозива, навіть узимку.",
            "Найбільше ціную, коли людина вміє слухати.",
            "Мрію проїхати Карпати на велосипеді."
        ];

        // Київ трапляється частіше, щоб стрічка не була порожньою
        private static readonly (string City, double Latitude, double Longitude)[] Cities =
        [
            ("Київ", 50.4501, 30.5234),
            ("Київ", 50.4501, 30.5234),
            ("Київ", 50.4501, 30.5234),
            ("Київ", 50.4501, 30.5234),
            ("Бровари", 50.5110, 30.7900),
            ("Ірпінь", 50.5218, 30.2506),
            ("Біла Церква", 49.7950, 30.1310),
            ("Львів", 49.8397, 24.0297),
            ("Одеса", 46.4825, 30.7233)
        ];

        private readonly AppDbContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly Random _random = new();

        // Імена роздаються без повторів, поки пул не вичерпається
        private readonly Dictionary<string, Queue<string>> _names = new();
        private readonly Dictionary<string, int> _rounds = new();

        public DevDataSeeder(AppDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<DevSeedResult> SeedAsync(int count, string? likeEmail, CancellationToken cancellationToken)
        {
            count = Math.Clamp(count, 1, 200);

            var interestIds = await _context.Interests.Where(i => i.IsActive).Select(i => i.Id).ToListAsync(cancellationToken);
            var languageIds = await _context.Languages.Where(l => l.IsActive).Select(l => l.Id).ToListAsync(cancellationToken);
            var promptIds = await _context.ProfilePrompts.Where(p => p.IsActive).Select(p => p.Id).ToListAsync(cancellationToken);

            UserProfile? invitee = null;
            string? note = null;

            if (!string.IsNullOrWhiteSpace(likeEmail))
            {
                invitee = await _context.UserProfiles
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.User.Email == likeEmail, cancellationToken);

                if (invitee is null)
                {
                    note = $"Профіль для {likeEmail} не знайдено — лайки не створені.";
                }
                else if (invitee.Preferences is null)
                {
                    note = $"У {likeEmail} не заповнені налаштування пошуку — лайки не створені.";
                    invitee = null;
                }
            }

            var passwordHash = _passwordHasher.Hash(Password);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var now = DateTime.UtcNow;

            var logins = new List<string>();
            var likesGiven = 0;

            for (var index = 0; index < count; index++)
            {
                var tailored = invitee is not null && index < TailoredLikes;

                var gender = tailored
                    ? Pick(invitee!.Preferences!.AcceptedGenders())
                    : index % 7 == 6 ? Gender.Other : index % 2 == 0 ? Gender.Female : Gender.Male;

                var age = tailored
                    ? _random.Next(invitee!.Preferences!.MinAge, Math.Min(invitee.Preferences.MaxAge, 55) + 1)
                    : _random.Next(19, 46);

                var showMe = tailored
                    ? DiscoveryPreferences.ShowMeValuesAccepting(invitee!.Gender)[0]
                    : gender switch
                    {
                        Gender.Female => Pick([InterestedIn.Men, InterestedIn.Men, InterestedIn.Everyone]),
                        Gender.Male => Pick([InterestedIn.Women, InterestedIn.Women, InterestedIn.Everyone]),
                        _ => InterestedIn.Everyone
                    };

                var preferences = tailored
                    ? new DiscoveryPreferences(showMe, 18, 99, null)
                    : new DiscoveryPreferences(showMe, _random.Next(18, 23), _random.Next(40, 61),
                        Pick<int?>([null, 20, 50, 100, 160]));

                var city = PickCity();

                var location = tailored && invitee!.Location is not null
                    ? Jitter(invitee.Location.Latitude, invitee.Location.Longitude, 0.02)
                    : city.Location;

                var person = NextPerson(gender);
                var email = $"seed{index + 1}-{Guid.NewGuid():N}"[..14] + EmailDomain;

                var profile = new UserProfile
                {
                    User = new User { Email = email, PasswordHash = passwordHash },
                    DisplayName = person.Name,
                    DateOfBirth = today.AddYears(-age).AddDays(-_random.Next(1, 300)),
                    Gender = gender,
                    Orientation = Maybe<SexualOrientation>(),
                    Bio = _random.Next(10) < 8 ? Pick(Bios) : null,
                    Occupation = _random.Next(10) < 7 ? Pick(Occupations) : null,
                    Company = _random.Next(10) < 5 ? Pick(Companies) : null,
                    School = _random.Next(10) < 4 ? Pick(Schools) : null,
                    HeightCm = _random.Next(10) < 7 ? _random.Next(155, 196) : null,
                    City = tailored && invitee!.Location is not null ? invitee.City : city.Name,
                    LookingFor = Maybe<RelationshipGoal>(),
                    FamilyPlans = Maybe<FamilyPlan>(),
                    Communication = Maybe<CommunicationStyle>(),
                    LoveLanguage = Maybe<LoveStyle>(),
                    Pets = Maybe<PetPreference>(),
                    Drinking = Maybe<DrinkingHabit>(),
                    Smoking = Maybe<SmokingHabit>(),
                    Workout = Maybe<WorkoutHabit>(),
                    Preferences = preferences,
                    Location = location,
                    LastLocationUpdatedAt = now.AddHours(-_random.Next(1, 72)),
                    LastActiveAt = now.AddHours(-_random.Next(1, 240))
                };

                var portrait = _random.Next(0, 100);

                for (var photo = 0; photo < _random.Next(1, 5); photo++)
                {
                    var seed = Guid.NewGuid().ToString("N");

                    profile.Photos.Add(new Photo
                    {
                        // Сервіси-заглушки, лише для розробки: перше фото — портрет
                        // відповідної статі, решта — краєвиди, як у справжніх анкетах
                        Url = photo == 0
                            ? $"https://randomuser.me/api/portraits/{person.Portraits}/{portrait}.jpg"
                            : $"https://picsum.photos/seed/{seed}/600/800",
                        PublicId = $"seed/{seed}",
                        IsMain = photo == 0,
                        Order = photo
                    });
                }

                foreach (var interestId in PickMany(interestIds, _random.Next(3, 6)))
                {
                    profile.Interests.Add(new UserInterest { InterestId = interestId });
                }

                foreach (var languageId in PickMany(languageIds, _random.Next(1, 4)))
                {
                    profile.Languages.Add(new UserLanguage { LanguageId = languageId });
                }

                var order = 0;

                foreach (var promptId in PickMany(promptIds, _random.Next(0, 4)))
                {
                    profile.PromptAnswers.Add(new ProfilePromptAnswer
                    {
                        ProfilePromptId = promptId,
                        Answer = Pick(Answers),
                        Order = order++
                    });
                }

                await _context.UserProfiles.AddAsync(profile, cancellationToken);

                if (tailored)
                {
                    await _context.Swipes.AddAsync(
                        new Swipe
                        {
                            SwiperProfileId = profile.Id,
                            TargetProfileId = invitee!.Id,
                            Direction = SwipeDirection.Like,
                            DecidedAt = now
                        },
                        cancellationToken);

                    likesGiven++;
                }

                if (logins.Count < 5)
                {
                    logins.Add(email);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new DevSeedResult(count, likesGiven, Password, logins, note);
        }

        public async Task<int> RemoveAsync(CancellationToken cancellationToken)
        {
            var profileIds = await _context.UserProfiles
                .Where(p => p.User.Email.EndsWith(EmailDomain))
                .Select(p => p.Id)
                .ToListAsync(cancellationToken);

            if (profileIds.Count > 0)
            {
                // Спершу те, що посилається на профілі: зовнішні ключі стоять на Restrict
                await _context.Matches
                    .Where(m => profileIds.Contains(m.ProfileOneId) || profileIds.Contains(m.ProfileTwoId))
                    .ExecuteDeleteAsync(cancellationToken);

                await _context.Swipes
                    .Where(s => profileIds.Contains(s.SwiperProfileId) || profileIds.Contains(s.TargetProfileId))
                    .ExecuteDeleteAsync(cancellationToken);
            }

            // Профілі, фото й зв'язки підуть каскадом за користувачем
            return await _context.Users
                .Where(u => u.Email.EndsWith(EmailDomain))
                .ExecuteDeleteAsync(cancellationToken);
        }

        // Ім'я без повторів, поки вистачає пулу. Далі пул перемішується заново,
        // а до імені додається номер кола: «Оксана 2».
        private (string Name, string Portraits) NextPerson(Gender gender)
        {
            var male = gender == Gender.Male || (gender == Gender.Other && _random.Next(2) == 0);
            var key = male ? "men" : "women";
            var pool = male ? MaleNames : FemaleNames;

            if (!_names.TryGetValue(key, out var queue) || queue.Count == 0)
            {
                queue = new Queue<string>(pool.OrderBy(_ => _random.Next()));
                _names[key] = queue;
                _rounds[key] = _rounds.GetValueOrDefault(key) + 1;
            }

            var round = _rounds[key];
            var name = queue.Dequeue();

            return (round == 1 ? name : $"{name} {round}", key);
        }

        private T Pick<T>(IReadOnlyList<T> items) => items[_random.Next(items.Count)];

        private IEnumerable<int> PickMany(IReadOnlyList<int> items, int howMany) =>
            items.OrderBy(_ => _random.Next()).Take(Math.Min(howMany, items.Count));

        private T? Maybe<T>() where T : struct, Enum
        {
            if (_random.Next(10) < 3)
            {
                return null;
            }

            var values = Enum.GetValues<T>();
            return values[_random.Next(values.Length)];
        }

        private (string Name, GeoLocation Location) PickCity()
        {
            var city = Pick(Cities);
            return (city.City, Jitter(city.Latitude, city.Longitude, 0.05));
        }

        private GeoLocation Jitter(double latitude, double longitude, double spread) =>
            new(latitude + (_random.NextDouble() - 0.5) * spread,
                longitude + (_random.NextDouble() - 0.5) * spread);
    }
}