using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken);
    Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken);
    // Разом із м'яко видаленими: з тією самою поштою може бути старий
    // видалений акаунт і новий
    Task<IReadOnlyList<Guid>> GetIdsByEmailIncludingDeletedAsync(string email, CancellationToken cancellationToken);
    Task AddAsync(User user, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
