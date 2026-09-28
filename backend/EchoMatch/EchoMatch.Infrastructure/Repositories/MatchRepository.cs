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

        public Task<Match?> GetForParticipantAsync(
    Guid matchId,
    Guid profileId,
    CancellationToken cancellationToken)
        {
            // Метч відстежується: виклик потрібен і для читання, і для MarkReadBy
            return _context.Matches
                .Where(m => m.Id == matchId)
                .Where(m => m.ProfileOneId == profileId || m.ProfileTwoId == profileId)
                .Where(m => m.ProfileOneId == profileId ? !m.ProfileTwo.IsDeleted : !m.ProfileOne.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);
        }


        public async Task<IReadOnlyList<Guid>> GetIdsForProfileAsync(
            Guid profileId,
            CancellationToken cancellationToken)
        {
            return await _context.Matches
                .AsNoTracking()
                .Where(m => m.ProfileOneId == profileId || m.ProfileTwoId == profileId)
                .Select(m => m.Id)
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<MatchListItem>> GetForProfileAsync(
            Guid profileId,
            CancellationToken cancellationToken)
        {
            // У парі я можу бути з будь-якого боку, тож кожне поле береться
            // з протилежного: у SQL це стає CASE WHEN на кожну колонку.
            // Порядок задає хендлер: список чатів сортується за останньою
            // активністю, і робити це двічі — у SQL і в пам'яті — лише плутало б
            return await _context.Matches
                .AsNoTracking()
                .Where(m => m.ProfileOneId == profileId || m.ProfileTwoId == profileId)
                .Select(m => new MatchListItem(
                    m.Id,
                    m.CreatedAt,
                    m.ProfileOneId == profileId ? m.ProfileOneSeenAt : m.ProfileTwoSeenAt,
                    m.ProfileOneId == profileId ? m.ProfileTwoId : m.ProfileOneId,
                    m.ProfileOneId == profileId ? m.ProfileTwo.DisplayName : m.ProfileOne.DisplayName,
                    m.ProfileOneId == profileId ? m.ProfileTwo.DateOfBirth : m.ProfileOne.DateOfBirth,
                     m.ProfileOneId == profileId
                        ? m.ProfileTwo.Photos.Where(p => p.IsMain).Select(p => p.Url).FirstOrDefault()
                        : m.ProfileOne.Photos.Where(p => p.IsMain).Select(p => p.Url).FirstOrDefault(),

                    // Останнє повідомлення й непрочитані — підзапити по Messages,
                    // а не навігація: колекція повідомлень у метчі спокушала б
                    // завантажити всю розмову там, де потрібен лише рядок списку
                    _context.Messages
                        .Where(x => x.MatchId == m.Id)
                        .OrderByDescending(x => x.Sequence)
                        .Select(x => x.Text)
                        .FirstOrDefault(),
                    _context.Messages
                        .Where(x => x.MatchId == m.Id)
                        .OrderByDescending(x => x.Sequence)
                        .Select(x => (DateTime?)x.CreatedAt)
                        .FirstOrDefault(),
                    _context.Messages
                        .Where(x => x.MatchId == m.Id)
                        .OrderByDescending(x => x.Sequence)
                        .Select(x => (Guid?)x.SenderProfileId)
                        .FirstOrDefault(),

                    // Свої повідомлення прочитані за визначенням
                    _context.Messages.Count(x => x.MatchId == m.Id
                        && x.SenderProfileId != profileId
                        && ((m.ProfileOneId == profileId ? m.ProfileOneLastReadAt : m.ProfileTwoLastReadAt) == null
                            || x.CreatedAt > (m.ProfileOneId == profileId
                                ? m.ProfileOneLastReadAt
                                : m.ProfileTwoLastReadAt)))))
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