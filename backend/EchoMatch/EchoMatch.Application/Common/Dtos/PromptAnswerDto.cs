using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Common.Dtos
{
    public record PromptAnswerDto(int PromptId, string Code, string Question, string Answer);
}
