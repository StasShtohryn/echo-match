using EchoMatch.Application.Common.Validation;
using FluentValidation;

namespace EchoMatch.Application.Features.Events.UploadEventCover
{
    public class UploadEventCoverCommandValidator : AbstractValidator<UploadEventCoverCommand>
    {
        public UploadEventCoverCommandValidator()
        {
            Include(new PhotoFileValidator<UploadEventCoverCommand>());
        }
    }
}