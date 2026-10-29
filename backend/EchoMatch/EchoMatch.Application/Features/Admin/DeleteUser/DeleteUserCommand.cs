using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Admin.DeleteUser
{
    public record DeleteUserCommand(string? Email) : ICommand<UserDeletionResultDto>;
}