

using FluentValidation;

namespace EchoMatch.Application.Features.Profiles.UploadPhoto
{
    public class UploadPhotoCommandValidator : AbstractValidator<UploadPhotoCommand>
    {
        private const long MaxBytes = 5 * 1024 * 1024;

        private static readonly string[] AllowedTypes =
            [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/heic",
                "image/heif"
            ];

        private static readonly string[] AllowedExtensions =
            [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

        public UploadPhotoCommandValidator()
        {
            RuleFor(x => x.FileName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Ім'я файлу відсутнє.")
                .Must(name => AllowedExtensions.Contains(Path.GetExtension(name).ToLowerInvariant()))
                .WithMessage("Дозволені формати: JPEG, PNG, WebP, HEIC.");

            RuleFor(x => x.Length)
                .GreaterThan(0).WithMessage("Файл порожній.")
                .LessThanOrEqualTo(MaxBytes).WithMessage("Максимальний розмір фото — 5 МБ.");

            //RuleFor(x => x.ContentType)
            //    .Must(type => AllowedTypes.Contains(type))
            //    .WithMessage("Дозволені формати: JPEG, PNG, WebP.");

        }
    }
}
