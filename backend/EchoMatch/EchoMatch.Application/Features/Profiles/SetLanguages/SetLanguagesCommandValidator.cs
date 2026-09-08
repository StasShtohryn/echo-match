using EchoMatch.Application.Features.Profiles.SetInterests;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Features.Profiles.SetLanguages
{
    public class SetLanguagesCommandValidator : AbstractValidator<SetLanguagesCommand>
    {
        private const int MaxLanguages = 10;

        public SetLanguagesCommandValidator()
        {
            RuleFor(x => x.LanguageIds)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(ids => ids.Count <= MaxLanguages)
                .WithMessage($"Можна обрати щонайбільше {MaxLanguages} мов.")
            .Must(ids => ids.Distinct().Count() == ids.Count)
                .WithMessage("Мови не повинні повторюватись.");
        }
    }
}
