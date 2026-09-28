using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IMessageRepository
    {
        Task AddAsync(Message message, CancellationToken cancellationToken);

        Task<IReadOnlyList<MessageListItem>> GetPageAsync(
            Guid matchId,
            Guid viewerProfileId,
            long? before,
            int limit,
            CancellationToken cancellationToken);

        Task<Message?> GetByIdAsync(Guid messageId, CancellationToken cancellationToken);

        Task<MessageReaction?> GetReactionAsync(
            Guid messageId,
            Guid profileId,
            CancellationToken cancellationToken);

        Task AddReactionAsync(MessageReaction reaction, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}