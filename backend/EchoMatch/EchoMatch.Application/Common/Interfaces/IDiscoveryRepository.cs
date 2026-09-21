using EchoMatch.Application.Common.Models;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IDiscoveryRepository
    {
        Task<IReadOnlyList<DiscoveryCandidate>> FindCandidatesAsync(
            DiscoveryCriteria criteria,
            int take,
            CancellationToken cancellationToken);
    }
}