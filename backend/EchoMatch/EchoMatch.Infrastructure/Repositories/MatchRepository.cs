using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EchoMatch.Infrastructure.Repositories
{
    public class MatchRepository : IMatchRepository
    {
        private readonly AppDbContext _context;

        public MatchRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Match match, CancellationToken cancellationToken)
        {
            await _context.Matches.AddAsync(match, cancellationToken);
        }


        public Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return _context.Matches.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        }

        public async Task<IReadOnlyList<MatchListItem>> GetForProfileAsync(
            Guid profileId,
            CancellationToken cancellationToken)
        {
            // У парі я можу бути з будь-якого боку, тож кожне поле береться
            // з протилежного: у SQL це стає CASE WHEN на кожну колонку
            return await _context.Matches
                .AsNoTracking()
                .Where(m => m.ProfileOneId == profileId || m.ProfileTwoId == profileId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new MatchListItem(
                    m.Id,
                    m.CreatedAt,
                    m.ProfileOneId == profileId ? m.ProfileOneSeenAt : m.ProfileTwoSeenAt,
                    m.ProfileOneId == profileId ? m.ProfileTwoId : m.ProfileOneId,
                    m.ProfileOneId == profileId ? m.ProfileTwo.DisplayName : m.ProfileOne.DisplayName,
                    m.ProfileOneId == profileId ? m.ProfileTwo.DateOfBirth : m.ProfileOne.DateOfBirth,
                    m.ProfileOneId == profileId
                        ? m.ProfileTwo.Photos.Where(p => p.IsMain).Select(p => p.Url).FirstOrDefault()
                        : m.ProfileOne.Photos.Where(p => p.IsMain).Select(p => p.Url).FirstOrDefault()))
                .ToListAsync(cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }
    }
}