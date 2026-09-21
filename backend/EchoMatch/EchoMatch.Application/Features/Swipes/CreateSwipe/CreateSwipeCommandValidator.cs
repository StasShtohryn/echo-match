using FluentValidation;

namespace EchoMatch.Application.Features.Swipes.CreateSwipe
{
    public class CreateSwipeCommandValidator : AbstractValidator<CreateSwipeCommand>
    {
        public CreateSwipeCommandValidator()
        {
            RuleFor(x => x.TargetProfileId)
                .NotEmpty().WithMessage("Не вказано, кого свайпнули.");

            RuleFor(x => x.Direction)
                .NotNull().WithMessage("Не вказано напрям свайпу.")
                .IsInEnum();
        }
    }
}