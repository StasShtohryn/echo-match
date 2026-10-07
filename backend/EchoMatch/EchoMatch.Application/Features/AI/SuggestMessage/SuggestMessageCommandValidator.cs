using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;
using FluentValidation;

namespace EchoMatch.Application.Features.Ai.SuggestMessage
{
    public class SuggestMessageCommandValidator : AbstractValidator<SuggestMessageCommand>
    {
        public SuggestMessageCommandValidator()
        {
            RuleFor(x => x.Kind)
                .Cascade(CascadeMode.Stop)
                .NotNull().WithMessage("Вид підказки обов'язковий.")
                .IsInEnum().WithMessage("Невідомий вид підказки.");

            RuleFor(x => x.Tone)
                .IsInEnum().WithMessage("Невідомий тон.");

            // Переписати або виправити можна лише те, що вже написано
            RuleFor(x => x.Draft)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Для цього виду підказки потрібен текст чернетки.")
                .MaximumLength(Message.MaxTextLength)
                    .WithMessage($"Чернетка — до {Message.MaxTextLength} символів.")
                .When(x => x.Kind is AiSuggestionKind.Rewrite or AiSuggestionKind.Grammar);
        }
    }
}