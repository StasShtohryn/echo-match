using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Auth.EmailConfirmation.ConfirmEmail
{
    public record ConfirmEmailCommand(string? Code) : ICommand<AuthResponseDto>;
}