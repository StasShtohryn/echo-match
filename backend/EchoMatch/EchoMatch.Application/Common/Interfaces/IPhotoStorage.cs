

using EchoMatch.Application.Common.Models;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IPhotoStorage
    {
        Task<PhotoUploadResult> UploadAsync(Stream content, string fileName, CancellationToken cancellationToken);
        Task DeleteAsync(string publicId, CancellationToken cancellationToken);
    }
}
