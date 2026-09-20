using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EchoMatch.Infrastructure.Repositories
{
    public class SwipeRepository : ISwipeRepository
    {
        private readonly AppDbContext _context;

        public SwipeRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<Swipe?> GetAsync(Guid swiperProfileId, Guid targetProfileId, CancellationToken cancellationToken)
        {
            return _context.Swipes.FirstOrDefaultAsync(
                s => s.SwiperProfileId == swiperProfileId && s.TargetProfileId == targetProfileId,
                cancellationToken);
        }

        public Task<bool> HasLikeAsync(Guid swiperProfileId, Guid targetProfileId, CancellationToken cancellationToken)
        {
            return _context.Swipes.AnyAsync(
                s => s.SwiperProfileId == swiperProfileId
                     && s.TargetProfileId == targetProfileId
                     && s.Direction == SwipeDirection.Like,
                cancellationToken);
        }

        public async Task AddAsync(Swipe swipe, CancellationToken cancellationToken)
        {
            await _context.Swipes.AddAsync(swipe, cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }
    }
}