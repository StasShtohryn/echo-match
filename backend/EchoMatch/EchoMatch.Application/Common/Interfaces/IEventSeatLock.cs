namespace EchoMatch.Application.Common.Interfaces
{
    // Тримає подію заблокованою до CommitAsync. Без нього двоє, що натиснули
    // «Піти» на останнє місце одночасно, обидва побачили б одне вільне місце
    // й обидва записалися б. Dispose без Commit відкочує зміни
    public interface IEventSeatLock : IAsyncDisposable
    {
        Task CommitAsync(CancellationToken cancellationToken);
    }
}