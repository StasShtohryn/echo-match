namespace EchoMatch.Application.Common.Dtos
{
    // Region віддається разом із сесією, щоб фронт стрімив туди, де її
    // створено, і регіон не був записаний у двох місцях
    public record FaceVerificationSessionDto(string SessionId, string Region);

    // Чи пройдено саму перевірку на живу людину
    public enum FaceVerificationStatus
    {
        Completed,       // жива людина; фото порівняно, підсумок — у Photos
        NotLive,         // сервіс не впевнений, що перед камерою жива людина
        Expired          // сесію не встигли пройти
    }

    // Підсумок для одного фото
    public enum PhotoFaceMatch
    {
        Verified,
        FaceMismatch,    // обличчя є, але не того, хто перед камерою
        NoFace           // на фото обличчя не знайдено
    }

    public record PhotoFaceCheckDto(Guid PhotoId, PhotoFaceMatch Match, float? Similarity);

    // Невдала перевірка — це результат, а не помилка запиту: клієнт показує
    // причину й пропонує спробувати ще раз. Photos — лише ті фото, що
    // перевірялися цього разу; вже перевірені раніше не порівнюються знову
    public record FaceVerificationResultDto(
        FaceVerificationStatus Status,
        float LivenessConfidence,
        bool IsProfileVerified,
        IReadOnlyList<PhotoFaceCheckDto> Photos);
}