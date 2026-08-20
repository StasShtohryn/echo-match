using EchoMatch.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Domain.Entities
{
    public class ProfilePrompt : LookupEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;

        public ICollection<ProfilePromptAnswer> Answers { get; set; } = new List<ProfilePromptAnswer>();
    }
}
