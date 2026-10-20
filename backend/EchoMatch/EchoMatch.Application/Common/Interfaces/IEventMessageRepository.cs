using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IEventMessageRepository
    {
        Task AddAsync(EventMessage message, CancellationToken cancellationToken);

        // Найновіші першими; before — Sequence найстарішого, яке клієнт уже має
        Task<IReadOnlyList<EventMessageListItem>> GetPageAsync(
            Guid eventId,
            long? before,
            int limit,
            CancellationToken cancellationToken);

        Task<EventMessageListItem?> GetItemAsync(Guid messageId, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}