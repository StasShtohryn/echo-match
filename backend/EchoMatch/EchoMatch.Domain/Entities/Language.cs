


using EchoMatch.Domain.Common;

namespace EchoMatch.Domain.Entities
{
    public class Language: LookupEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;

        public ICollection<UserLanguage> UserLanguages { get; set; } = new List<UserLanguage>();
    }



    public class UserLanguage
    {
        public Guid UserProfileId { get; set; }
        public UserProfile UserProfile { get; set; } = null!;

        public int LanguageId { get; set; }
        public Language Language { get; set; } = null!;
    }
}
