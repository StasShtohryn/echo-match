using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Common.Dtos
{
    public record LookupsDto
    {
        public required IReadOnlyList<LookupItemDto> Interests { get; init; }
        public required IReadOnlyList<LookupItemDto> Languages { get; init; }
        public required IReadOnlyList<LookupItemDto> Prompts { get; init; }
        public required EnumOptionsDto Options { get; init; }
    }
}
