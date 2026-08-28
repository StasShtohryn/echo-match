using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken);
    Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken);
    Task AddAsync(User user, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
