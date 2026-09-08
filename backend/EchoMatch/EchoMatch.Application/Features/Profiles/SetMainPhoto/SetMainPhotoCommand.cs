

using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.SetMainPhoto
{
    public record SetMainPhotoCommand(Guid PhotoId) : ICommand<Unit>;
}
