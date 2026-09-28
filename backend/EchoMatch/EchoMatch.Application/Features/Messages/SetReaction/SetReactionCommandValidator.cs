using FluentValidation;

namespace EchoMatch.Application.Features.Messages.SetReaction
{
    public class SetReactionCommandValidator : AbstractValidator<SetReactionCommand>
    {
        public SetReactionCommandValidator()
        {
            RuleFor(x => x.Type)
                .Cascade(CascadeMode.Stop)
                .NotNull().WithMessage("Реакція обов'язкова.")
                .IsInEnum().WithMessage("Невідома реакція.");
        }
    }
}