using EchoMatch.Domain.ValueObjects;
using FluentValidation;

namespace EchoMatch.Application.Features.Profiles.UpdatePreferences
{
    public class UpdatePreferencesCommandValidator : AbstractValidator<UpdatePreferencesCommand>
    {
        public UpdatePreferencesCommandValidator()
        {
            RuleFor(x => x.ShowMe)
                .NotNull().WithMessage("Оберіть, кого показувати.")
                .IsInEnum();

            RuleFor(x => x.MinAge)
                .InclusiveBetween(DiscoveryPreferences.MinAllowedAge, DiscoveryPreferences.MaxAllowedAge)
                .WithMessage($"Мінімальний вік — від {DiscoveryPreferences.MinAllowedAge} до {DiscoveryPreferences.MaxAllowedAge}.");

            RuleFor(x => x.MaxAge)
                .InclusiveBetween(DiscoveryPreferences.MinAllowedAge, DiscoveryPreferences.MaxAllowedAge)
                .WithMessage($"Максимальний вік — від {DiscoveryPreferences.MinAllowedAge} до {DiscoveryPreferences.MaxAllowedAge}.")
                .GreaterThanOrEqualTo(x => x.MinAge)
                .WithMessage("Максимальний вік не може бути меншим за мінімальний.");

            RuleFor(x => x.MaxDistanceKm)
                .InclusiveBetween(DiscoveryPreferences.MinAllowedDistanceKm, DiscoveryPreferences.MaxAllowedDistanceKm)
                .WithMessage($"Відстань — від {DiscoveryPreferences.MinAllowedDistanceKm} до {DiscoveryPreferences.MaxAllowedDistanceKm} км, або без обмеження.");
        }
    }
}