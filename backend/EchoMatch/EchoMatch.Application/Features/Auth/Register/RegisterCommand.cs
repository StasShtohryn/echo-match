using EchoMatch.Application.Common.Dtos;
using MediatR;

namespace EchoMatch.Application.Features.Auth.Register;

public record RegisterCommand(string Email, string Password) : IRequest<AuthResponseDto>;
