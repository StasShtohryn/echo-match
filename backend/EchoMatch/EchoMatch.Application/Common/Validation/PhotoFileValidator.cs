using FluentValidation;

namespace EchoMatch.Application.Common.Validation
{
    // Одні правила для всіх картинок, щоб формати й ліміт не розійшлися між
    // фото профілю й обкладинкою. Підключається через Include у валідаторі
    // конкретної команди; узагальнений тип сканер збірки не реєструє
    public class PhotoFileValidator<T> : AbstractValidator<T> where T : IPhotoFile
    {
        private const long MaxBytes = 5 * 1024 * 1024;

        private static readonly string[] AllowedExtensions =
            [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

        public PhotoFileValidator()
        {
            RuleFor(x => x.FileName)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Ім'я файлу відсутнє.")
                .Must(name => AllowedExtensions.Contains(Path.GetExtension(name).ToLowerInvariant()))
                .WithMessage("Дозволені формати: JPEG, PNG, WebP, HEIC.");

            RuleFor(x => x.Length)
                .GreaterThan(0).WithMessage("Файл порожній.")
                .LessThanOrEqualTo(MaxBytes).WithMessage("Максимальний розмір фото — 5 МБ.");
        }
    }
}