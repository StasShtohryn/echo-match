

using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IProfileRepository
    {
        Task<bool> ExistsForUserAsync(Guid userId, CancellationToken cancellationToken);
        Task AddAsync(UserProfile profile, CancellationToken cancellationToken);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
