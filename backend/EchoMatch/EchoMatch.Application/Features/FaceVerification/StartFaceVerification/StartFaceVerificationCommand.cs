using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.FaceVerification.StartFaceVerification
{
    public record StartFaceVerificationCommand : ICommand<FaceVerificationSessionDto>;
}