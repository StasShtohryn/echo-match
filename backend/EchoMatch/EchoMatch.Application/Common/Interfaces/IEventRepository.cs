using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IEventRepository
    {
        Task AddAsync(Event @event, CancellationToken cancellationToken);

        // Відстежується, скасовані теж: що з ними робити, вирішує хендлер
        Task<Event?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<bool> CategoryExistsAsync(int categoryId, CancellationToken cancellationToken);

        Task<IReadOnlyList<EventListItem>> SearchAsync(
            EventSearchCriteria criteria,
            Guid myProfileId,
            int skip,
            int take,
            CancellationToken cancellationToken);

        Task<EventDetailsItem?> GetDetailsAsync(Guid eventId, Guid myProfileId, CancellationToken cancellationToken);

        // Чинна участь будь-якого статусу; та, з якої людина вийшла, сюди не потрапляє
        Task<EventParticipant?> GetParticipationAsync(Guid eventId, Guid profileId, CancellationToken cancellationToken);

        Task<int> CountApprovedAsync(Guid eventId, CancellationToken cancellationToken);

        Task<IReadOnlyList<EventMemberItem>> GetMembersAsync(
            Guid eventId,
            EventParticipantStatus status,
            CancellationToken cancellationToken);


        // Один учасник чи заявник будь-якого статусу: щоб сказати іншим,
        // хто саме приєднався чи друкує
        Task<EventMemberItem?> GetMemberAsync(Guid eventId, Guid profileId, CancellationToken cancellationToken);

        // Кому слати живі оновлення: Id користувачів прийнятих учасників,
        // а з includePending — ще й тих, чия заявка чекає рішення
        Task<IReadOnlyList<Guid>> GetMemberUserIdsAsync(
            Guid eventId,
            bool includePending,
            CancellationToken cancellationToken);


        // Позначки прочитання прийнятих учасників, крім того, хто питає
        Task<IReadOnlyList<EventReadMark>> GetReadMarksAsync(
            Guid eventId,
            Guid exceptProfileId,
            CancellationToken cancellationToken);

        // Події, які людина організує, на які йде або чекає рішення; минулі
        // й скасовані теж, відхилені — ні
        Task<IReadOnlyList<EventMineItem>> GetMineAsync(Guid myProfileId, CancellationToken cancellationToken);

        Task<IEventSeatLock> LockSeatsAsync(Guid eventId, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}