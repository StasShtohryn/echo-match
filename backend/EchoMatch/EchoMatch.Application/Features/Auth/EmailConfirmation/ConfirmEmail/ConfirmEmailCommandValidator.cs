using EchoMatch.Application.Features.Auth.EmailConfirmation;
using FluentValidation;

namespace EchoMatch.Application.Features.Auth.EmailConfirmation.ConfirmEmail
{
    public class ConfirmEmailCommandValidator : AbstractValidator<ConfirmEmailCommand>
    {
        public ConfirmEmailCommandValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .Matches($"^[0-9]{{{EmailConfirmationRules.CodeLength}}}$")
                .WithMessage($"Код — {EmailConfirmationRules.CodeLength} цифр.");
        }
    }
}