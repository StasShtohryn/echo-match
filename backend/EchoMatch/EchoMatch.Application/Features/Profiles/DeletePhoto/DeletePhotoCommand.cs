using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.DeletePhoto
{
    public record DeletePhotoCommand(Guid PhotoId) : ICommand<Unit>;
}
