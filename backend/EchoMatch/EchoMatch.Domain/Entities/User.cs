using EchoMatch.Domain.Common;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
}
