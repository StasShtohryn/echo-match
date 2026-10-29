namespace EchoMatch.Application.Common.Dtos;

// false Ч кл≥Їнт веде на екран коду: решта API в≥дпов≥датиме 403, доки
// пошту не п≥дтверджено
public record AuthResponseDto(Guid UserId, string Email, string AccessToken, bool IsEmailConfirmed);
