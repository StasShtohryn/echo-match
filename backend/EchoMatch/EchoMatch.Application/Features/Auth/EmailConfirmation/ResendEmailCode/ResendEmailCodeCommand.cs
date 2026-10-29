using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Auth.EmailConfirmation.ResendEmailCode
{
    public record ResendEmailCodeCommand : ICommand<Unit>;
}