using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EchoMatch.Infrastructure.Repositories
{
    // Порядок задають зовнішні ключі: усе, що посилається на профіль через
    // Restrict, має зникнути раніше за нього. IgnoreQueryFilters скрізь, бо
    // м'яко видалений свайп чи метч так само тримає профіль ключем
    public class UserDataEraser : IUserDataEraser
    {
        private readonly AppDbContext _context;

        public UserDataEraser(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<string>> EraseAsync(
            IReadOnlyCollection<Guid> userIds,
            CancellationToken cancellationToken)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            var profileIds = await _context.UserProfiles
                .IgnoreQueryFilters()
                .Where(p => userIds.Contains(p.UserId))
                .Select(p => p.Id)
                .ToListAsync(cancellationToken);

            var files = new List<string>();

            if (profileIds.Count > 0)
            {
                files.AddRange(await _context.Photos
                    .IgnoreQueryFilters()
                    .Where(p => profileIds.Contains(p.UserProfileId))
                    .Select(p => p.PublicId)
                    .ToListAsync(cancellationToken));

                files.AddRange(await _context.Events
                    .IgnoreQueryFilters()
                    .Where(e => profileIds.Contains(e.OrganizerProfileId) && e.CoverPublicId != null)
                    .Select(e => e.CoverPublicId!)
                    .ToListAsync(cancellationToken));

                // Події людини: учасники й чат підуть каскадом за подією
                await _context.Events
                    .IgnoreQueryFilters()
                    .Where(e => profileIds.Contains(e.OrganizerProfileId))
                    .ExecuteDeleteAsync(cancellationToken);

                // Сліди в чужих подіях
                await _context.EventMessages
                    .IgnoreQueryFilters()
                    .Where(m => profileIds.Contains(m.SenderProfileId))
                    .ExecuteDeleteAsync(cancellationToken);

                await _context.EventParticipants
                    .IgnoreQueryFilters()
                    .Where(p => profileIds.Contains(p.ProfileId))
                    .ExecuteDeleteAsync(cancellationToken);

                // Метчі: повідомлення й реакції в них підуть каскадом за метчем
                await _context.Matches
                    .IgnoreQueryFilters()
                    .Where(m => profileIds.Contains(m.ProfileOneId) || profileIds.Contains(m.ProfileTwoId))
                    .ExecuteDeleteAsync(cancellationToken);

                await _context.Swipes
                    .IgnoreQueryFilters()
                    .Where(s => profileIds.Contains(s.SwiperProfileId) || profileIds.Contains(s.TargetProfileId))
                    .ExecuteDeleteAsync(cancellationToken);
            }

            // Профіль, фото, відповіді, інтереси й мови — каскадом за користувачем
            await _context.Users
                .IgnoreQueryFilters()
                .Where(u => userIds.Contains(u.Id))
                .ExecuteDeleteAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return files;
        }
    }
}