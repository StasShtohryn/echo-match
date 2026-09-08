using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using Microsoft.Extensions.Options;

namespace EchoMatch.Infrastructure.Storage;

public class CloudinaryPhotoStorage : IPhotoStorage
{
    private const string Folder = "echomatch/profiles";

    private readonly Cloudinary _cloudinary;

    public CloudinaryPhotoStorage(IOptions<CloudinarySettings> settings)
    {
        var value = settings.Value;

        var account = new Account(value.CloudName, value.ApiKey, value.ApiSecret);

        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
    }

    public async Task<PhotoUploadResult> UploadAsync(
        Stream content,
        string fileName,
        CancellationToken cancellationToken)
    {
        var parameters = new ImageUploadParams
        {
            File = new FileDescription(fileName, content),
            Folder = Folder,
            Format = "jpg",
            Transformation = new Transformation()
                .Width(1200)
                .Height(1200)
                .Crop("limit")
                .Quality("auto")
        };

        var result = await _cloudinary.UploadAsync(parameters, cancellationToken);

        if (result.Error is not null)
        {
            throw new InvalidOperationException($"Не вдалося завантажити фото: {result.Error.Message}");
        }

        return new PhotoUploadResult(result.SecureUrl.ToString(), result.PublicId);
    }

    public async Task DeleteAsync(string publicId, CancellationToken cancellationToken)
    {
        var parameters = new DeletionParams(publicId) { ResourceType = ResourceType.Image };

        var result = await _cloudinary.DestroyAsync(parameters);

        if (result.Error is not null)
        {
            throw new InvalidOperationException($"Не вдалося видалити фото: {result.Error.Message}");
        }
    }
}