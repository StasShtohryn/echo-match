using EchoMatch.Application.Common.Extensions;
using EchoMatch.Domain.Entities;
using FluentValidation;

namespace EchoMatch.Application.Features.Events.Common
{
    // Підключається через Include у валідаторах створення й редагування;
    // узагальнений тип сканер збірки не реєструє сам по собі
    public class EventFieldsValidator<T> : AbstractValidator<T> where T : IEventFields
    {
        public EventFieldsValidator()
        {
            RuleFor(x => x.Title)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Вкажіть назву події.")
                .MaximumLength(Event.MaxTitleLength)
                .WithMessage($"Назва — щонайбільше {Event.MaxTitleLength} символів.");

            RuleFor(x => x.Description)
                .MaximumLength(Event.MaxDescriptionLength)
                .WithMessage($"Опис — щонайбільше {Event.MaxDescriptionLength} символів.");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0).WithMessage("Оберіть категорію.");

            RuleFor(x => x.StartsAt)
                .Must(startsAt => startsAt.AsUtc() > DateTime.UtcNow)
                .WithMessage("Подія має починатися в майбутньому.")
                .Must(startsAt => startsAt.AsUtc() <= DateTime.UtcNow + Event.MaxScheduleAhead)
                .WithMessage("Подію можна запланувати щонайбільше на рік уперед.");

            RuleFor(x => x.EndsAt)
                .Must((fields, endsAt) => endsAt is null || endsAt.Value.AsUtc() > fields.StartsAt.AsUtc())
                .WithMessage("Кінець має бути пізніше за початок.");

            RuleFor(x => x.City)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Вкажіть місто.")
                .MaximumLength(Event.MaxCityLength)
                .WithMessage($"Місто — щонайбільше {Event.MaxCityLength} символів.");

            RuleFor(x => x.PlaceName)
                .MaximumLength(Event.MaxPlaceNameLength)
                .WithMessage($"Адреса — щонайбільше {Event.MaxPlaceNameLength} символів.");

            RuleFor(x => x.Capacity)
                .InclusiveBetween(Event.MinCapacity, Event.MaxCapacity)
                .When(x => x.Capacity is not null)
                .WithMessage($"Кількість місць — від {Event.MinCapacity} до {Event.MaxCapacity}, або без обмеження.");

            RuleFor(x => x.JoinPolicy)
                .NotNull().WithMessage("Оберіть, як записуватися на подію.")
                .IsInEnum();
        }
    }
}