namespace EchoMatch.Application.Common.Interfaces
{
    // Остаточне видалення акаунтів з усім, що вони залишили в базі, в одній
    // транзакції. Повертає PublicId файлів у сховищі, які лишилися без рядків:
    // їх прибирає той, хто викликав, уже після успішного видалення з бази
    public interface IUserDataEraser
    {
        Task<IReadOnlyList<string>> EraseAsync(IReadOnlyCollection<Guid> userIds, CancellationToken cancellationToken);
    }
}