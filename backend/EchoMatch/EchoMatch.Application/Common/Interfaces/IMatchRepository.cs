using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IMatchRepository
    {
        Task AddAsync(Match match, CancellationToken cancellationToken);
        Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        // «Мій метч»: я в парі, і співрозмовник ще існує
        Task<Match?> GetForParticipantAsync(Guid matchId, Guid profileId, CancellationToken cancellationToken);
        
        // Тільки ідентифікатори: використовується для підписок хаба на з'єднанні
        Task<IReadOnlyList<Guid>> GetIdsForProfileAsync(Guid profileId, CancellationToken cancellationToken);

        Task<IReadOnlyList<MatchListItem>> GetForProfileAsync(Guid profileId, CancellationToken cancellationToken);

        Task<MatchCountsDto> CountForProfileAsync(Guid profileId, CancellationToken cancellationToken);

        Task<bool> ExistsForPairAsync(Guid profileA, Guid profileB, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}