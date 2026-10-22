using FluentValidation;

namespace EchoMatch.Application.Features.EventMessages.GetEventMessages
{
    public class GetEventMessagesQueryValidator : AbstractValidator<GetEventMessagesQuery>
    {
        public GetEventMessagesQueryValidator()
        {
            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100).WithMessage("Розмір сторінки — від 1 до 100.");
        }
    }
}