using EchoMatch.Application.Common.Models;

namespace EchoMatch.Application.Common.Interfaces
{
    // Перевірка «жива людина» і порівняння облич. Відео йде з браузера прямо
    // в сервіс, сюди потрапляють лише результати
    public interface IFaceVerificationService
    {
        // Регіон, де створено сесію: браузер мусить стрімити відео саме туди
        string Region { get; }

        Task<string> CreateSessionAsync(CancellationToken cancellationToken);

        Task<FaceLivenessResult> GetLivenessResultAsync(string sessionId, CancellationToken cancellationToken);

        // Схожість найкращого збігу у відсотках; null — на фото не знайдено обличчя
        Task<float?> CompareWithPhotoAsync(
            byte[] referenceImage,
            string photoUrl,
            CancellationToken cancellationToken);
    }
}