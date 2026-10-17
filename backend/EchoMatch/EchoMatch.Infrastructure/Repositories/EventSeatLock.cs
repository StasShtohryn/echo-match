using EchoMatch.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace EchoMatch.Infrastructure.Repositories
{
    internal sealed class EventSeatLock : IEventSeatLock
    {
        private readonly IDbContextTransaction _transaction;

        public EventSeatLock(IDbContextTransaction transaction)
        {
            _transaction = transaction;
        }

        public Task CommitAsync(CancellationToken cancellationToken)
        {
            return _transaction.CommitAsync(cancellationToken);
        }

        // Без Commit транзакція відкочується, і замок знімається разом із нею
        public ValueTask DisposeAsync()
        {
            return _transaction.DisposeAsync();
        }
    }
}