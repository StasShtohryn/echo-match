namespace EchoMatch.Application.Common.Validation
{
    // Усе, що завантажує картинку: фото профілю, обкладинка події
    public interface IPhotoFile
    {
        string FileName { get; }
        long Length { get; }
    }
}