using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IMatchRepository
    {
        Task AddAsync(Match match, CancellationToken cancellationToken);
    }
}