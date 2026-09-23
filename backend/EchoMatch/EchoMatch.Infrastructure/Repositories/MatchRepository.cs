using EchoMatch.Application.Common.Dtos;
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


        public async Task<MatchCountsDto> CountForProfileAsync(Guid profileId, CancellationToken cancellationToken)
        {
            // Звернення до партнера змушує EF додати JOIN, а глобальний фільтр
            // прибирає метчі з видаленими профілями — так само, як у списку
            var counts = await _context.Matches
                .Where(m => m.ProfileOneId == profileId || m.ProfileTwoId == profileId)
                .Where(m => m.ProfileOneId == profileId ? !m.ProfileTwo.IsDeleted : !m.ProfileOne.IsDeleted)
                .GroupBy(_ => 1)
                .Select(g => new MatchCountsDto(
                    g.Count(),
                    g.Count(m => (m.ProfileOneId == profileId ? m.ProfileOneSeenAt : m.ProfileTwoSeenAt) == null)))
                .FirstOrDefaultAsync(cancellationToken);

            // Жодного метчу — групувати нічого, запит повертає порожньо
            return counts ?? new MatchCountsDto(0, 0);
        }

        public Task<bool> ExistsForPairAsync(
            Guid profileA,
            Guid profileB,
            CancellationToken cancellationToken)
        {
            return _context.Matches.AnyAsync(
                m => (m.ProfileOneId == profileA && m.ProfileTwoId == profileB)
                     || (m.ProfileOneId == profileB && m.ProfileTwoId == profileA),
                cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }
    }
}