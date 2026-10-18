using EchoMatch.Domain.Entities;
using FluentValidation;

namespace EchoMatch.Application.Common.Validation
{
    // Одні правила тексту для обох чатів, щоб ліміт не розійшовся між ними
    public class MessageTextValidator<T> : AbstractValidator<T> where T : IMessageText
    {
        public MessageTextValidator()
        {
            RuleFor(x => x.Text)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Повідомлення не може бути порожнім.")
                .MaximumLength(Message.MaxTextLength)
                    .WithMessage($"Повідомлення — до {Message.MaxTextLength} символів.");
        }
    }
}