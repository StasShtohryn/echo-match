using EchoMatch.Application.Common.Extensions;
using EchoMatch.Domain.Entities;
using FluentValidation;

namespace EchoMatch.Application.Features.Events.GetEvents
{
    public class GetEventsQueryValidator : AbstractValidator<GetEventsQuery>
    {
        public GetEventsQueryValidator()
        {
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(1).WithMessage("Сторінки рахуються з 1.");

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 50).WithMessage("limit — від 1 до 50.");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0).When(x => x.CategoryId is not null)
                .WithMessage("Невідома категорія.");

            RuleFor(x => x.City)
                .MaximumLength(Event.MaxCityLength)
                .WithMessage($"Місто — щонайбільше {Event.MaxCityLength} символів.");

            // Один символ збігся б майже з усім, і такий пошук лише вантажить базу
            RuleFor(x => x.Search)
                .Must(search => search!.Trim().Length is >= 2 and <= 100)
                .When(x => !string.IsNullOrWhiteSpace(x.Search))
                .WithMessage("Пошук — від 2 до 100 символів.");

            RuleFor(x => x.To)
                .Must((query, to) => to!.Value.AsUtc() >= query.From!.Value.AsUtc())
                .When(x => x.From is not null && x.To is not null)
                .WithMessage("Кінець періоду не може бути раніше за початок.");
        }
    }
}