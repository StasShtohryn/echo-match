using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EchoMatch.Infrastructure.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly AppDbContext _context;

        public MessageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Message message, CancellationToken cancellationToken)
        {
            await _context.Messages.AddAsync(message, cancellationToken);
        }

        public async Task<IReadOnlyList<MessageListItem>> GetPageAsync(
            Guid matchId,
            Guid viewerProfileId,
            long? before,
            int limit,
            CancellationToken cancellationToken)
        {
            // Курсор — номер, а не час: він строго зростає, тож умова строга
            // і кожна сторінка рівно на limit повідомлень просуває історію
            return await _context.Messages
                .AsNoTracking()
                .Where(m => m.MatchId == matchId)
                .Where(m => before == null || m.Sequence < before)
                .OrderByDescending(m => m.Sequence)
                .Take(limit)
                .Select(m => new MessageListItem(
                    m.Id,
                    m.Sequence,
                    m.SenderProfileId,
                    m.Text,
                    m.CreatedAt,

                    // Реакцій на повідомлення максимум дві, бо в розмові двоє:
                    // «чужа» — це просто та, що не моя
                    _context.MessageReactions
                        .Where(r => r.MessageId == m.Id && r.ProfileId == viewerProfileId)
                        .Select(r => (ReactionType?)r.Type)
                        .FirstOrDefault(),
                    _context.MessageReactions
                        .Where(r => r.MessageId == m.Id && r.ProfileId != viewerProfileId)
                        .Select(r => (ReactionType?)r.Type)
                        .FirstOrDefault()))
                .ToListAsync(cancellationToken);
        }


        public Task<Message?> GetByIdAsync(Guid messageId, CancellationToken cancellationToken)
        {
            return _context.Messages.FirstOrDefaultAsync(m => m.Id == messageId, cancellationToken);
        }

        public Task<MessageReaction?> GetReactionAsync(
            Guid messageId,
            Guid profileId,
            CancellationToken cancellationToken)
        {
            // Чинна реакція на пару може бути лише одна — це стереже фільтрований
            // унікальний індекс. Single, а не First: краще впасти, ніж узяти випадкову
            return _context.MessageReactions.SingleOrDefaultAsync(
                r => r.MessageId == messageId && r.ProfileId == profileId,
                cancellationToken);
        }

        public async Task AddReactionAsync(MessageReaction reaction, CancellationToken cancellationToken)
        {
            await _context.MessageReactions.AddAsync(reaction, cancellationToken);
        }


        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }
    }
}