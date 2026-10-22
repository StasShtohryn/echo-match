using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using EchoMatch.Application.Common.Validation;

namespace EchoMatch.Application.Features.Events.UploadEventCover
{
    public record UploadEventCoverCommand(Guid EventId, Stream Content, string FileName, long Length)
        : ICommand<EventCoverDto>, IPhotoFile;
}