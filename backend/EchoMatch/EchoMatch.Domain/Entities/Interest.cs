using EchoMatch.Domain.Common;

namespace EchoMatch.Domain.Entities
{
    public class Interest: LookupEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;

        public ICollection<UserInterest> UserInterests { get; set; } = new List<UserInterest>();
    }
}
