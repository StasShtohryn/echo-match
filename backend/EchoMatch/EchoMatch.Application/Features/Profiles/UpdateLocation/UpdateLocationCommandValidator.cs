using FluentValidation;

namespace EchoMatch.Application.Features.Profiles.UpdateLocation
{
    public class UpdateLocationCommandValidator : AbstractValidator<UpdateLocationCommand>
    {
        public UpdateLocationCommandValidator()
        {
            RuleFor(x => x.Latitude)
                .NotNull().WithMessage("Широта обов'язкова.")
                .InclusiveBetween(-90.0, 90.0).WithMessage("Широта — від -90 до 90.");

            RuleFor(x => x.Longitude)
                .NotNull().WithMessage("Довгота обов'язкова.")
                .InclusiveBetween(-180.0, 180.0).WithMessage("Довгота — від -180 до 180.");
        }
    }
}