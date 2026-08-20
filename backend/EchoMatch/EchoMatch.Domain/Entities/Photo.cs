

using EchoMatch.Domain.Common;

namespace EchoMatch.Domain.Entities
{
    public class Photo: BaseEntity
    {
        public Guid UserProfileId { get; set; }
        public UserProfile UserProfile { get; set; } = null!;
        public string Url { get; set; } = string.Empty;
        public string PublicId { get; set; } = string.Empty;
        public bool IsMain { get; set; }
        public int Order { get; set; }
    }
}
