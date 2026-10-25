using FluentValidation;

namespace EchoMatch.Application.Features.FaceVerification.CompleteFaceVerification
{
    public class CompleteFaceVerificationCommandValidator : AbstractValidator<CompleteFaceVerificationCommand>
    {
        public CompleteFaceVerificationCommandValidator()
        {
            RuleFor(x => x.SessionId)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Не вказано сесію перевірки.")
                .MaximumLength(100).WithMessage("Некоректний id сесії.");
        }
    }
}