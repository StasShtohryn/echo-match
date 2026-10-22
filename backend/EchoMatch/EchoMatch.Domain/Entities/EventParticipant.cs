using EchoMatch.Domain.Common;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Domain.Entities
{
    public class EventParticipant : BaseEntity
    {
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;

        public Guid ProfileId { get; set; }
        public UserProfile Profile { get; set; } = null!;

        public EventParticipantStatus Status { get; private set; }

        // Докуди учасник прочитав груповий чат. Та сама ідея, що й у метчі,
        // лише позначка лежить на учаснику, бо людей більше ніж двоє
        public DateTime? LastReadAt { get; private set; }

        private EventParticipant() { }

        // Створюється лише через Event.EnrolOrganizer і Event.Join: статус
        // нової участі залежить від правил події, а не від того, хто її додає
        internal static EventParticipant Create(Guid profileId, EventParticipantStatus status) =>
            new() { ProfileId = profileId, Status = status };

        public void Approve()
        {
            if (Status != EventParticipantStatus.Pending)
            {
                throw new InvalidOperationException("Only a pending request can be approved.");
            }

            Status = EventParticipantStatus.Approved;
        }

        // І відхилена заявка, і вигнаний учасник. Рядок лишається чинним,
        // тож унікальний індекс не дасть одразу подати заявку знову
        public void Reject()
        {
            Status = EventParticipantStatus.Rejected;
        }

        // Вийти самому, на відміну від відмови, можна без сліду: рядок
        // позначається видаленим, і пара звільняється для нового запису
        public void Leave(DateTime utcNow)
        {
            IsDeleted = true;
            DeletedAt = utcNow;
        }

        public void MarkRead(DateTime utcNow)
        {
            if (Status != EventParticipantStatus.Approved)
            {
                throw new InvalidOperationException("Only an approved participant reads the chat.");
            }

            LastReadAt = utcNow;
        }
    }
}