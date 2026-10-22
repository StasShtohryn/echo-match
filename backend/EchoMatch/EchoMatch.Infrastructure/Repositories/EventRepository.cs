using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace EchoMatch.Infrastructure.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly AppDbContext _context;

        public EventRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Event @event, CancellationToken cancellationToken)
        {
            await _context.Events.AddAsync(@event, cancellationToken);
        }

        public Task<Event?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return _context.Events.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        }

        public Task<bool> CategoryExistsAsync(int categoryId, CancellationToken cancellationToken)
        {
            return _context.EventCategories.AnyAsync(c => c.Id == categoryId && c.IsActive, cancellationToken);
        }

        public async Task<IReadOnlyList<EventListItem>> SearchAsync(
            EventSearchCriteria criteria,
            Guid myProfileId,
            int skip,
            int take,
            CancellationToken cancellationToken)
        {
            var query = _context.Events
                .AsNoTracking()
                .Where(e => e.CancelledAt == null && e.StartsAt > criteria.Now);

            if (criteria.CategoryId is { } categoryId)
            {
                query = query.Where(e => e.CategoryId == categoryId);
            }

            // Порівняння без урахування регістру дає сама колація бази
            if (criteria.City is { } city)
            {
                query = query.Where(e => e.City == city);
            }

            if (criteria.Search is { } search)
            {
                query = query.Where(e => e.Title.Contains(search));
            }

            if (criteria.From is { } from)
            {
                query = query.Where(e => e.StartsAt >= from);
            }

            if (criteria.To is { } to)
            {
                query = query.Where(e => e.StartsAt <= to);
            }

            // Id — другим ключем: без нього події з однаковим часом могли б
            // перескакувати між сторінками
            return await query
                .OrderBy(e => e.StartsAt)
                .ThenBy(e => e.Id)
                .Skip(skip)
                .Take(take)
                .Select(ToListItem(myProfileId))
                .ToListAsync(cancellationToken);
        }

        public async Task<EventDetailsItem?> GetDetailsAsync(
            Guid eventId,
            Guid myProfileId,
            CancellationToken cancellationToken)
        {
            var card = await _context.Events
                .AsNoTracking()
                .Where(e => e.Id == eventId)
                .Select(ToListItem(myProfileId))
                .FirstOrDefaultAsync(cancellationToken);

            if (card is null)
            {
                return null;
            }

            // Окремим запитом, щоб проєкцію картки не дублювати заради трьох полів
            var extras = await _context.Events
                .AsNoTracking()
                .Where(e => e.Id == eventId)
                .Select(e => new
                {
                    e.Description,
                    e.CancelledAt,
                    PendingCount = e.Participants.Count(p => p.Status == EventParticipantStatus.Pending)
                })
                .FirstAsync(cancellationToken);

            return new EventDetailsItem(card, extras.Description, extras.CancelledAt, extras.PendingCount);
        }

        public Task<EventParticipant?> GetParticipationAsync(
            Guid eventId,
            Guid profileId,
            CancellationToken cancellationToken)
        {
            return _context.EventParticipants
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.ProfileId == profileId, cancellationToken);
        }

        public Task<int> CountApprovedAsync(Guid eventId, CancellationToken cancellationToken)
        {
            return _context.EventParticipants
                .CountAsync(p => p.EventId == eventId && p.Status == EventParticipantStatus.Approved, cancellationToken);
        }

        public async Task<IReadOnlyList<EventMemberItem>> GetMembersAsync(
            Guid eventId,
            EventParticipantStatus status,
            CancellationToken cancellationToken)
        {
            return await _context.EventParticipants
                .AsNoTracking()
                .Where(p => p.EventId == eventId && p.Status == status)
                .Select(ToMemberItem)
                .ToListAsync(cancellationToken);
        }

        public Task<EventMemberItem?> GetMemberAsync(Guid eventId, Guid profileId, CancellationToken cancellationToken)
        {
            return _context.EventParticipants
                .AsNoTracking()
                .Where(p => p.EventId == eventId && p.ProfileId == profileId)
                .Select(ToMemberItem)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<Guid>> GetMemberUserIdsAsync(
            Guid eventId,
            bool includePending,
            CancellationToken cancellationToken)
        {
            return await _context.EventParticipants
                .AsNoTracking()
                .Where(p => p.EventId == eventId
                    && (p.Status == EventParticipantStatus.Approved
                        || (includePending && p.Status == EventParticipantStatus.Pending)))
                .Select(p => p.Profile.UserId)
                .ToListAsync(cancellationToken);
        }


        public async Task<IReadOnlyList<EventReadMark>> GetReadMarksAsync(
            Guid eventId,
            Guid exceptProfileId,
            CancellationToken cancellationToken)
        {
            return await _context.EventParticipants
                .AsNoTracking()
                .Where(p => p.EventId == eventId
                    && p.Status == EventParticipantStatus.Approved
                    && p.ProfileId != exceptProfileId)
                .Select(p => new EventReadMark(p.ProfileId, p.LastReadAt))
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<EventMineItem>> GetMineAsync(
            Guid myProfileId,
            CancellationToken cancellationToken)
        {
            // Картки — тією самою проєкцією, що й у списку подій
            var cards = await _context.Events
                .AsNoTracking()
                .Where(e => e.Participants.Any(p => p.ProfileId == myProfileId
                    && p.Status != EventParticipantStatus.Rejected))
                .Select(ToListItem(myProfileId))
                .ToListAsync(cancellationToken);

            // Стан чату — окремим запитом від моєї участі, бо позначка прочитання
            // лежить на ній. Останнє повідомлення — кількома підзапитами TOP(1),
            // як у списку метчів: вони дешевші за одну вибірку з ROW_NUMBER
            var chats = await _context.EventParticipants
                .AsNoTracking()
                .Where(p => p.ProfileId == myProfileId && p.Status != EventParticipantStatus.Rejected)
                .Select(p => new
                {
                    p.EventId,
                    p.Event.CancelledAt,
                    JoinedAt = p.CreatedAt,
                    LastText = _context.EventMessages
                        .Where(m => m.EventId == p.EventId)
                        .OrderByDescending(m => m.Sequence)
                        .Select(m => m.Text)
                        .FirstOrDefault(),
                    LastSentAt = _context.EventMessages
                        .Where(m => m.EventId == p.EventId)
                        .OrderByDescending(m => m.Sequence)
                        .Select(m => (DateTime?)m.CreatedAt)
                        .FirstOrDefault(),
                    LastSenderId = _context.EventMessages
                        .Where(m => m.EventId == p.EventId)
                        .OrderByDescending(m => m.Sequence)
                        .Select(m => (Guid?)m.SenderProfileId)
                        .FirstOrDefault(),
                    LastSenderName = _context.EventMessages
                        .Where(m => m.EventId == p.EventId)
                        .OrderByDescending(m => m.Sequence)
                        .Select(m => m.SenderProfile.DisplayName)
                        .FirstOrDefault(),

                    // Свої повідомлення прочитані за визначенням
                    Unread = _context.EventMessages.Count(m => m.EventId == p.EventId
                        && m.SenderProfileId != myProfileId
                        && (p.LastReadAt == null || m.CreatedAt > p.LastReadAt))
                })
                .ToListAsync(cancellationToken);

            var chatByEvent = chats.ToDictionary(c => c.EventId);

            // Між двома запитами людина могла вийти: таку подію просто пропускаємо
            return cards
                .Where(card => chatByEvent.ContainsKey(card.Id))
                .Select(card =>
                {
                    var chat = chatByEvent[card.Id];

                    return new EventMineItem(
                        card,
                        chat.CancelledAt,
                        chat.JoinedAt,
                        chat.LastText,
                        chat.LastSentAt,
                        chat.LastSenderId,
                        chat.LastSenderName,
                        chat.Unread);
                })
                .ToList();
        }



        public async Task<IEventSeatLock> LockSeatsAsync(Guid eventId, CancellationToken cancellationToken)
        {
            var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            // UPDLOCK тримається до кінця транзакції: другий запит на ту саму
            // подію чекає тут, доки перший не збереже свій запис
            await _context.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT Id FROM Events WITH (UPDLOCK, ROWLOCK) WHERE Id = {eventId}",
                cancellationToken);

            return new EventSeatLock(transaction);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }


        // Одна проєкція на список учасників, заявок і на одного учасника
        private static readonly Expression<Func<EventParticipant, EventMemberItem>> ToMemberItem =
            p => new EventMemberItem(
                p.ProfileId,
                p.Profile.DisplayName,
                p.Profile.DateOfBirth,
                p.Profile.Photos.Where(photo => photo.IsMain).Select(photo => photo.Url).FirstOrDefault(),
                p.Profile.IsFaceVerified,
                p.CreatedAt,
                p.Status);

        // Одна проєкція на список і на сторінку події, щоб картка не розійшлася
        private static Expression<Func<Event, EventListItem>> ToListItem(Guid myProfileId) =>
            e => new EventListItem(
                e.Id,
                e.Title,
                e.CategoryId,
                e.Category.Code,
                e.Category.Name,
                e.StartsAt,
                e.EndsAt,
                e.City,
                e.PlaceName,
                e.CoverUrl,
                e.JoinPolicy,
                e.Capacity,
                e.Participants.Count(p => p.Status == EventParticipantStatus.Approved),
                e.Participants
                    .Where(p => p.ProfileId == myProfileId)
                    .Select(p => (EventParticipantStatus?)p.Status)
                    .FirstOrDefault(),
                e.OrganizerProfileId == myProfileId,
                e.OrganizerProfileId,
                e.OrganizerProfile.DisplayName,
                e.OrganizerProfile.Photos.Where(p => p.IsMain).Select(p => p.Url).FirstOrDefault());
    }
}