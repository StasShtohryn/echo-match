

using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EchoMatch.Infrastructure.Repositories
{
    public class LookupRepository : ILookupRepository
    {
        private readonly AppDbContext _context;

        public LookupRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Interest>> GetActiveInterestsAsync(CancellationToken cancellationToken)
        {
            return await _context.Interests
                .AsNoTracking()
                .Where(i => i.IsActive)
                .OrderBy(i => i.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<Language>> GetActiveLanguagesAsync(CancellationToken cancellationToken)
        {
            return await _context.Languages
                .AsNoTracking()
                .Where(l => l.IsActive)
                .OrderBy(l => l.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<ProfilePrompt>> GetActivePromptsAsync(CancellationToken cancellationToken)
        {
            return await _context.ProfilePrompts
                .AsNoTracking()
                .Where(p => p.IsActive)
                .OrderBy(p => p.Id)
                .ToListAsync(cancellationToken);
        }
    }
}
