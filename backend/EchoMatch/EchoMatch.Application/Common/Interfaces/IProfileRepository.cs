

using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IProfileRepository
    {
        Task<bool> ExistsForUserAsync(Guid userId, CancellationToken cancellationToken);
        Task AddAsync(UserProfile profile, CancellationToken cancellationToken);
        Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken);
        Task<UserProfile?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<UserProfile?> GetByUserIdWithInterestsAsync(Guid userId, CancellationToken cancellationToken);
        Task<UserProfile?> GetByUserIdWithLanguagesAsync(Guid userId, CancellationToken cancellationToken);
        Task<UserProfile?> GetByUserIdWithPromptAnswersAsync(Guid userId, CancellationToken cancellationToken);

        Task<UserProfile?> GetByUserIdWithDetailsAsync(Guid userId, CancellationToken cancellationToken);
        Task<UserProfile?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken);

        Task<UserProfile?> GetByUserIdWithPhotosAsync(Guid userId, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
