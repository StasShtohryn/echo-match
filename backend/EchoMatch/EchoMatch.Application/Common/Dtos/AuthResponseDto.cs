namespace EchoMatch.Application.Common.Dtos;

public record AuthResponseDto(Guid UserId, string Email, string AccessToken);
