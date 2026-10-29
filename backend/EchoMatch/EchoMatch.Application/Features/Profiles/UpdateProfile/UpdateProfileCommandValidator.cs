

using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;
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
            RuleFor(x => x.School).MaximumLength(UserProfile.MaxSchoolLength);
            RuleFor(x => x.City).MaximumLength(100);
            RuleFor(x => x.InstagramHandle).MaximumLength(30);
            RuleFor(x => x.SpotifyHandle).MaximumLength(50);

            RuleFor(x => x.HeightCm).InclusiveBetween(120, 250);

            RuleFor(x => x.Orientation).IsInEnum();
            RuleFor(x => x.LookingFor).IsInEnum();
            RuleFor(x => x.FamilyPlans).IsInEnum();
            RuleFor(x => x.Communication).IsInEnum();
            RuleFor(x => x.LoveLanguage).IsInEnum();
            RuleForEach(x => x.Pets).IsInEnum();
            RuleFor(x => x.Pets!)
                .Must(pets => pets.Count <= PetPreferenceRules.MaxSelected)
                .WithMessage($"Не більше {PetPreferenceRules.MaxSelected} варіантів.")
                .Must(pets => pets.Distinct().Count() == pets.Count)
                .WithMessage("Варіанти не мають повторюватися.")
                .Must(PetPreferenceRules.AreConsistent)
                .WithMessage("«Немає тварин» не поєднується з тваринами, які є.")
                .When(x => x.Pets is not null);
            RuleFor(x => x.Drinking).IsInEnum();
            RuleFor(x => x.Smoking).IsInEnum();
            RuleFor(x => x.Workout).IsInEnum();
        }
    }
}
