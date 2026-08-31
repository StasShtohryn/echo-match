

using FluentValidation;

namespace EchoMatch.Application.Features.Profiles.UpdateProfile
{
    public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
    {
        public UpdateProfileCommandValidator()
        {
            RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Gender).IsInEnum();

            RuleFor(x => x.Bio).MaximumLength(500);
            RuleFor(x => x.Occupation).MaximumLength(100);
            RuleFor(x => x.Company).MaximumLength(100);
            RuleFor(x => x.School).MaximumLength(100);
            RuleFor(x => x.InstagramHandle).MaximumLength(30);
            RuleFor(x => x.SpotifyHandle).MaximumLength(50);

            RuleFor(x => x.HeightCm).InclusiveBetween(120, 250);

            RuleFor(x => x.Orientation).IsInEnum();
            RuleFor(x => x.LookingFor).IsInEnum();
            RuleFor(x => x.FamilyPlans).IsInEnum();
            RuleFor(x => x.Communication).IsInEnum();
            RuleFor(x => x.LoveLanguage).IsInEnum();
            RuleFor(x => x.Pets).IsInEnum();
            RuleFor(x => x.Drinking).IsInEnum();
            RuleFor(x => x.Smoking).IsInEnum();
            RuleFor(x => x.Workout).IsInEnum();
        }
    }
}
