using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Features.Profiles.SetPromptAnswers
{
    public class SetPromptAnswersCommandValidator : AbstractValidator<SetPromptAnswersCommand>
    {
        private const int MaxAnswers = 3;
        private const int MaxAnswerLength = 124;

        public SetPromptAnswersCommandValidator()
        {
            RuleFor(x => x.Answers)
                .Cascade(CascadeMode.Stop)
                .NotNull()
                .Must(answers => answers.Count <= MaxAnswers)
                    .WithMessage($"Можна відповісти щонайбільше на {MaxAnswers} питання.")
                .Must(answers => answers.Select(a => a.PromptId).Distinct().Count() == answers.Count)
                    .WithMessage("На одне питання можна відповісти лише раз.");

            RuleForEach(x => x.Answers).ChildRules(answer =>
            {
                answer.RuleFor(a => a.PromptId).GreaterThan(0);
                answer.RuleFor(a => a.Answer)
                    .NotEmpty()
                    .MaximumLength(MaxAnswerLength);
            });
        }
    }
}
