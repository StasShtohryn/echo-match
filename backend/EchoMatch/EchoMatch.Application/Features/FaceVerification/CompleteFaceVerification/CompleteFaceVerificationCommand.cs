using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.FaceVerification.CompleteFaceVerification
{
    // Лише id сесії. Кадр для порівняння сервер бере з сервісу сам: якби його
    // надсилав клієнт, підсунути можна було б будь-яке фото
    public record CompleteFaceVerificationCommand(string? SessionId) : ICommand<FaceVerificationResultDto>;
}