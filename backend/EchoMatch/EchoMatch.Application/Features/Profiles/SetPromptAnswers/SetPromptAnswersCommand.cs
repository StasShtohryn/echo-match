using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Features.Profiles.SetPromptAnswers
{
    public record PromptAnswerInput(int PromptId, string Answer);

    public record SetPromptAnswersCommand(IReadOnlyList<PromptAnswerInput> Answers)
        : ICommand<IReadOnlyList<PromptAnswerDto>>;
}
