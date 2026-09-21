using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface ISwipeRepository
    {
        Task<Swipe?> GetAsync(Guid swiperProfileId, Guid targetProfileId, CancellationToken cancellationToken);

        Task<bool> HasLikeAsync(Guid swiperProfileId, Guid targetProfileId, CancellationToken cancellationToken);

        Task AddAsync(Swipe swipe, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}