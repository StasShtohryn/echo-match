using EchoMatch.Domain.Common;
using EchoMatch.Domain.Enums;
using EchoMatch.Domain.ValueObjects;

namespace EchoMatch.Domain.Entities
{
    public class Event : BaseEntity
    {
        public const int MaxTitleLength = 100;
        public const int MaxDescriptionLength = 2000;
        public const int MaxCityLength = 100;
        public const int MaxPlaceNameLength = 200;
        public const int MinCapacity = 2;
        public const int MaxCapacity = 500;

        // Подія більш ніж за рік — це вже не план, а намір
        public static readonly TimeSpan MaxScheduleAhead = TimeSpan.FromDays(365);

        // Організатор зберігається тут, а не роллю серед учасників: інакше той
        // самий факт жив би у двох місцях і міг би розійтися
        public Guid OrganizerProfileId { get; set; }
        public UserProfile OrganizerProfile { get; set; } = null!;

        public int CategoryId { get; set; }
        public EventCategory Category { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public DateTime StartsAt { get; set; }
        public DateTime? EndsAt { get; set; }

        public string City { get; set; } = string.Empty;
        public string? PlaceName { get; set; }

        // null — без обмеження. Рахуються лише прийняті учасники, організатор теж
        public int? Capacity { get; set; }

        public EventJoinPolicy JoinPolicy { get; set; }

        public string? CoverUrl { get; set; }
        public string? CoverPublicId { get; set; }

        // Скасування — не видалення: учасники мають побачити, що подію
        // скасовано, і далі читати чат
        public DateTime? CancelledAt { get; private set; }

        public ICollection<EventParticipant> Participants { get; set; } = new List<EventParticipant>();

        public bool IsOrganizedBy(Guid profileId) => OrganizerProfileId == profileId;

        public bool HasStarted(DateTime utcNow) => StartsAt <= utcNow;

        public bool HasRoomFor(int approvedCount) => Capacity is null || approvedCount < Capacity;


        // Організатор теж учасник: так «хто йде», «хто в чаті» і «кому рахувати
        // непрочитані» — одна й та сама множина без окремих випадків
        public EventParticipant EnrolOrganizer()
        {
            var organizer = EventParticipant.Create(OrganizerProfileId, EventParticipantStatus.Approved);
            Participants.Add(organizer);
            return organizer;
        }

        // Відкрита подія приймає одразу, решта чекає рішення організатора.
        // Чи є ще місце, перевіряє той, хто знає кількість прийнятих
        public EventParticipant Join(Guid profileId)
        {
            var participant = EventParticipant.Create(
                profileId,
                JoinPolicy == EventJoinPolicy.Open
                    ? EventParticipantStatus.Approved
                    : EventParticipantStatus.Pending);

            Participants.Add(participant);
            return participant;
        }

        public void Cancel(DateTime utcNow)
        {
            CancelledAt ??= utcNow;
        }
    }
}