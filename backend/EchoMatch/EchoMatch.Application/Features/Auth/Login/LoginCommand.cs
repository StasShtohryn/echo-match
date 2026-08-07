using EchoMatch.Application.Common.Dtos;
using MediatR;

namespace EchoMatch.Application.Features.Auth.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponseDto>;
