using FluentValidation;


namespace EchoMatch.Application.Features.Profiles.SetInterests
{
    public class SetInterestsCommandValidator : AbstractValidator<SetInterestsCommand>
    {
        private const int MaxInterests = 5;

        public SetInterestsCommandValidator()
        {
            RuleFor(x => x.InterestIds)
                .Cascade(CascadeMode.Stop)
                .NotNull()
                .Must(ids => ids.Count <= MaxInterests)
                    .WithMessage($"Можна обрати щонайбільше {MaxInterests} інтересів.")
                .Must(ids => ids.Distinct().Count() == ids.Count)
                    .WithMessage("Інтереси не повинні повторюватись.");
        }
    }
}
