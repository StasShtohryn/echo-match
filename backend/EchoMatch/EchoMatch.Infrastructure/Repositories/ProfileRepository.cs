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
        public Task<UserProfile?> GetByUserIdWithInterestsAsync(Guid userId, CancellationToken cancellationToken)
        {
            return _context.UserProfiles
                .Include(p => p.Interests)
                .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        }

        public Task<UserProfile?> GetByUserIdWithLanguagesAsync(Guid userId, CancellationToken cancellationToken)
        {
            return _context.UserProfiles
                .Include(p => p.Languages)
                .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        }

        public Task<UserProfile?> GetByUserIdWithPromptAnswersAsync(Guid userId, CancellationToken cancellationToken)
        {
            return _context.UserProfiles
                .Include(p => p.PromptAnswers)
                .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        }


        private IQueryable<UserProfile> WithDetails()
        {
            return _context.UserProfiles
                .Include(p => p.Photos)
                .Include(p => p.Interests).ThenInclude(link => link.Interest)
                .Include(p => p.Languages).ThenInclude(link => link.Language)
                .Include(p => p.PromptAnswers).ThenInclude(answer => answer.ProfilePrompt)
                .AsSplitQuery();
        }

        public Task<UserProfile?> GetByUserIdWithDetailsAsync(Guid userId, CancellationToken cancellationToken)
        {
            return WithDetails().FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        }

        public Task<UserProfile?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken)
        {
            return WithDetails().AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        public Task<UserProfile?> GetByUserIdWithPhotosAsync(Guid userId, CancellationToken cancellationToken)
        {
            return _context.UserProfiles
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }
    }
}
