using EchoMatch.Domain.Entities;
using FluentValidation;

namespace EchoMatch.Application.Features.Messages.SendMessage
{
    public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
    {
        public SendMessageCommandValidator()
        {
            RuleFor(x => x.Text)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Повідомлення не може бути порожнім.")
                .MaximumLength(Message.MaxTextLength)
                    .WithMessage($"Повідомлення — до {Message.MaxTextLength} символів.");
        }
    }
}