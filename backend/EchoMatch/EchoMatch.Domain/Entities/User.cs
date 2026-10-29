using EchoMatch.Domain.Common;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? GoogleId { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    // Пошту підтверджено кодом із листа, через Google, або акаунт створено,
    // коли підтвердження було вимкнене
    public bool IsEmailConfirmed { get; private set; }

    // Хеш, а не сам код: витік бази не дає підтвердити чужу пошту
    public string? EmailCodeHash { get; private set; }
    public DateTime? EmailCodeExpiresAt { get; private set; }
    public DateTime? EmailCodeSentAt { get; private set; }
    public int EmailCodeAttempts { get; private set; }

    // Новий код скасовує попередній і обнуляє лічильник спроб
    public void IssueEmailCode(string codeHash, DateTime utcNow, TimeSpan lifetime)
    {
        EmailCodeHash = codeHash;
        EmailCodeSentAt = utcNow;
        EmailCodeExpiresAt = utcNow + lifetime;
        EmailCodeAttempts = 0;
    }

    public void RecordFailedEmailCodeAttempt()
    {
        EmailCodeAttempts++;
    }

    public void ConfirmEmail()
    {
        IsEmailConfirmed = true;
        EmailCodeHash = null;
        EmailCodeExpiresAt = null;
        EmailCodeAttempts = 0;
    }

    public UserProfile? Profile { get; set; }
}
