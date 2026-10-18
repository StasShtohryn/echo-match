using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace EchoMatch.Infrastructure.Repositories
{
    public class EventMessageRepository : IEventMessageRepository
    {
        private readonly AppDbContext _context;

        public EventMessageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(EventMessage message, CancellationToken cancellationToken)
        {
            await _context.EventMessages.AddAsync(message, cancellationToken);
        }

        public async Task<IReadOnlyList<EventMessageListItem>> GetPageAsync(
            Guid eventId,
            long? before,
            int limit,
            CancellationToken cancellationToken)
        {
            // Курсор — номер, а не час, як і в чаті метчу: умова строга, і
            // кожна сторінка рівно на limit повідомлень просуває історію
            return await _context.EventMessages
                .AsNoTracking()
                .Where(m => m.EventId == eventId)
                .Where(m => before == null || m.Sequence < before)
                .OrderByDescending(m => m.Sequence)
                .Take(limit)
                .Select(ToListItem)
                .ToListAsync(cancellationToken);
        }

        public Task<EventMessageListItem?> GetItemAsync(Guid messageId, CancellationToken cancellationToken)
        {
            return _context.EventMessages
                .AsNoTracking()
                .Where(m => m.Id == messageId)
                .Select(ToListItem)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }

        // Одна проєкція на сторінку історії й на щойно надіслане повідомлення
        private static readonly Expression<Func<EventMessage, EventMessageListItem>> ToListItem =
            m => new EventMessageListItem(
                m.Id,
                m.Sequence,
                m.SenderProfileId,
                m.SenderProfile.DisplayName,
                m.SenderProfile.Photos.Where(p => p.IsMain).Select(p => p.Url).FirstOrDefault(),
                m.Text,
                m.CreatedAt);
    }
}