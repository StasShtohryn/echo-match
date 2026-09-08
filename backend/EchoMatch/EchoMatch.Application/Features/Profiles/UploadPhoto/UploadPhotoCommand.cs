using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Profiles.UploadPhoto
{
    public record UploadPhotoCommand(Stream Content, string FileName, string ContentType, long Length) : ICommand<PhotoDto>;
}
