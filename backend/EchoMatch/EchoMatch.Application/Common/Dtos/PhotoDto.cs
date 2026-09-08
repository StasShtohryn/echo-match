using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Common.Dtos
{
    public record PhotoDto(Guid Id, string Url, bool IsMain, int Order);
}
