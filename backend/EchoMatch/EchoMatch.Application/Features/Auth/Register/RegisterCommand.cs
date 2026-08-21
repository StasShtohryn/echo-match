using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Auth.Register;

public record RegisterCommand(string Email, string Password) : ICommand<AuthResponseDto>;
