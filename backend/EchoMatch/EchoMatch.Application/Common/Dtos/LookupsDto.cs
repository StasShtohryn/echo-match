using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Common.Dtos
{
    public record LookupsDto(
    IReadOnlyList<LookupItemDto> Interests,
    IReadOnlyList<LookupItemDto> Languages,
    IReadOnlyList<LookupItemDto> Prompts);
}
