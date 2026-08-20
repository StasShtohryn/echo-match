using EchoMatch.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Domain.Entities
{
    public class ProfilePromptAnswer : BaseEntity
    {
        public Guid UserProfileId { get; set; }
        public UserProfile UserProfile { get; set; } = null!;

        public int ProfilePromptId { get; set; }
        public ProfilePrompt ProfilePrompt { get; set; } = null!;

        public string Answer { get; set; } = string.Empty;
        public int Order { get; set; }
    }
}
