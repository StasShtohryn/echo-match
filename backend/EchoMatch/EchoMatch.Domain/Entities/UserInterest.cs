

namespace EchoMatch.Domain.Entities
{
    public class UserInterest
    {
        public Guid UserProfileId { get; set; }
        public UserProfile UserProfile { get; set; } = null!;

        public int InterestId { get; set; }
        public Interest Interest { get; set; } = null!;
    }
}
