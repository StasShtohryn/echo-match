
namespace EchoMatch.Domain.Common
{
    public abstract class LookupEntity
    {
        public int Id { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
