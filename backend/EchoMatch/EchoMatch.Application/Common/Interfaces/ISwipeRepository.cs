using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface ISwipeRepository
    {
        Task<Swipe?> GetAsync(Guid swiperProfileId, Guid targetProfileId, CancellationToken cancellationToken);

        Task<bool> HasLikeAsync(Guid swiperProfileId, Guid targetProfileId, CancellationToken cancellationToken);

        // Нескасовані лайки профілю людям, чиї профілі ще існують
        Task<LikeCounts> CountLikesAsync(Guid profileId, CancellationToken cancellationToken);

        Task AddAsync(Swipe swipe, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}