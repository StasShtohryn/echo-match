namespace EchoMatch.Application.Common.Security
{
    public static class AuthClaims
    {
        // "true" або "false". Токен, виданий до підтвердження, лишається
        // непідтвердженим, тож після коду клієнт отримує новий
        public const string EmailVerified = "email_verified";
    }
}