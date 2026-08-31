using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EchoMatch.Infrastructure.Repositories
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly AppDbContext _context;

        public ProfileRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<bool> ExistsForUserAsync(Guid userId, CancellationToken cancellationToken)
        {
            return _context.UserProfiles.AnyAsync(p => p.UserId == userId, cancellationToken);
        }

        public async Task AddAsync(UserProfile profile, CancellationToken cancellationToken)
        {
            await _context.UserProfiles.AddAsync(profile, cancellationToken);
        }

        public Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken)
        {
            return _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        }

        public Task<UserProfile?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return _context.UserProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }
    }
}
