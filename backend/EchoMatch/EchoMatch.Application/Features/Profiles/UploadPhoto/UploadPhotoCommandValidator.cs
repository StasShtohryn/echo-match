

using EchoMatch.Application.Common.Validation;
using FluentValidation;

namespace EchoMatch.Application.Features.Profiles.UploadPhoto
{
    public class UploadPhotoCommandValidator : AbstractValidator<UploadPhotoCommand>
    {

        public UploadPhotoCommandValidator()
        {
            Include(new PhotoFileValidator<UploadPhotoCommand>());

        }
    }
}
