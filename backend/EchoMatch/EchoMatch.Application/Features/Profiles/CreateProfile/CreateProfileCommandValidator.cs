using FluentValidation;


namespace EchoMatch.Application.Features.Profiles.CreateProfile
{
    public class CreateProfileCommandValidator : AbstractValidator<CreateProfileCommand>
    {
        private const int MinimumAge = 18;
        private const int MaximumAge = 100;

        public CreateProfileCommandValidator()
        {
            RuleFor(x => x.DisplayName)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.Gender)
                .IsInEnum();

            RuleFor(x => x.DateOfBirth)
                .Must(BeAtLeastMinimumAge)
                .WithMessage($"Користувач має бути не молодшим за {MinimumAge} років.")
                .Must(BeRealistic)
                .WithMessage("Вкажіть коректну дату народження.");
        }

        private static bool BeAtLeastMinimumAge(DateOnly dateOfBirth)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            return dateOfBirth <= today.AddYears(-MinimumAge);
        }

        private static bool BeRealistic(DateOnly dateOfBirth)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            return dateOfBirth >= today.AddYears(-MaximumAge);
        }
    }
}
