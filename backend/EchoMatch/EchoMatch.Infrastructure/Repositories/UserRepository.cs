using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace EchoMatch.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return _context.Users.AnyAsync(u => u.Email == email, cancellationToken);
    }

    public Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken)
    {
        return _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken)
    {
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        // ƒв≥ реЇстрац≥њ з одн≥Їю поштою водночас: обидв≥ пройшли перев≥рку, а
        // ≥ндекс пропустив лише першу. ƒруга Ч конфл≥кт, а не зб≥й сервера
        catch (DbUpdateException exception) when (exception.InnerException is SqlException { Number: 2601 or 2627 })
        {
            throw new ConflictException("A user with this email already exists.");
        }
    }
}
