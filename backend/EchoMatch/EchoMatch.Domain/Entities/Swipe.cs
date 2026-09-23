using EchoMatch.Domain.Common;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Domain.Entities
{
    public class Swipe : BaseEntity
    {
        // Через скільки пропущена людина знову може з'явитися в стрічці.
        // Лайк не старіє ніколи: без відповіді це ще не завершений метч.
        public static readonly TimeSpan DislikeExpiry = TimeSpan.FromDays(30);

        public Guid SwiperProfileId { get; set; }
        public UserProfile SwiperProfile { get; set; } = null!;

        public Guid TargetProfileId { get; set; }
        public UserProfile TargetProfile { get; set; } = null!;

        public SwipeDirection Direction { get; set; }

        // Коли прийнято чинне рішення. Збігається з CreatedAt, доки застарілий
        // дизлайк не переглянули — тоді рядок оновлюється, а не дублюється.
        public DateTime DecidedAt { get; set; }

        public bool IsExpired(DateTime utcNow) =>
            Direction == SwipeDirection.Dislike && DecidedAt <= utcNow - DislikeExpiry;

        // Скасування: рядок лишається в базі, але перестає враховуватись —
        // людина повертається в стрічку, а унікальний індекс звільняє пару
        public void Undo(DateTime utcNow)
        {
            IsDeleted = true;
            DeletedAt = utcNow;
        }
    }
}