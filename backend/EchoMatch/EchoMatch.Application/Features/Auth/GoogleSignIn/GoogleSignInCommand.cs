using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;


namespace EchoMatch.Application.Features.Auth.GoogleSignIn
{
    public record GoogleSignInCommand(string IdToken) : ICommand<AuthResponseDto>;
}
