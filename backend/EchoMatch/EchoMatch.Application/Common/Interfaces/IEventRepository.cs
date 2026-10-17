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

        Task<IEventSeatLock> LockSeatsAsync(Guid eventId, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}