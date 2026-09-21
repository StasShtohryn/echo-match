using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IMatchRepository
    {
        Task AddAsync(Match match, CancellationToken cancellationToken);
        Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<IReadOnlyList<MatchListItem>> GetForProfileAsync(Guid profileId, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}