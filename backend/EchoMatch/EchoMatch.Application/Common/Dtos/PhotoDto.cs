
namespace EchoMatch.Application.Common.Dtos
{
    public record PhotoDto(Guid Id, string Url, bool IsMain, int Order, bool IsFaceVerified);
}
