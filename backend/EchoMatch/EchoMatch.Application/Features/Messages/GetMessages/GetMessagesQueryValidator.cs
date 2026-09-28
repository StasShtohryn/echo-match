using FluentValidation;

namespace EchoMatch.Application.Features.Messages.GetMessages
{
    public class GetMessagesQueryValidator : AbstractValidator<GetMessagesQuery>
    {
        public GetMessagesQueryValidator()
        {
            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 100).WithMessage("Розмір сторінки — від 1 до 100.");
        }
    }
}