namespace EchoMatch.Application.Common.Models
{
    // LastReadAt null — учасник ще нічого не прочитав
    public record EventReadMark(Guid ProfileId, DateTime? LastReadAt);
}