using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
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

        public async Task<LikeCounts> CountLikesAsync(Guid profileId, CancellationToken cancellationToken)
        {
            // Скасовані лайки прибирає глобальний фільтр, а лайки людям, чиїх
            // профілів уже немає, — умова на цільовий профіль
            var likes = _context.Swipes.Where(s =>
                s.SwiperProfileId == profileId
                && s.Direction == SwipeDirection.Like
                && !s.TargetProfile.IsDeleted);

            var given = await likes.CountAsync(cancellationToken);

            var mutual = await likes.CountAsync(
                s => _context.Swipes.Any(back =>
                    back.SwiperProfileId == s.TargetProfileId
                    && back.TargetProfileId == profileId
                    && back.Direction == SwipeDirection.Like),
                cancellationToken);

            return new LikeCounts(given, mutual);
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