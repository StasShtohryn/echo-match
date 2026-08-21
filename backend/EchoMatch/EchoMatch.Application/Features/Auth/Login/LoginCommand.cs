using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Auth.Login;

public record LoginCommand(string Email, string Password) : ICommand<AuthResponseDto>;
