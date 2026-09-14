using FluentValidation;

namespace EchoMatch.Application.Features.Profiles.UpdateVisibility
{
    public class UpdateVisibilityCommandValidator : AbstractValidator<UpdateVisibilityCommand>
    {
        public UpdateVisibilityCommandValidator()
        {
            RuleFor(x => x.IsPrivate)
                .NotNull().WithMessage("Вкажіть, чи приховати профіль.");
        }
    }
}