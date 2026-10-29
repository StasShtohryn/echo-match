namespace EchoMatch.Api.Security
{
    public static class AuthPolicies
    {
        // Лише вхід, без вимоги підтвердженої пошти: для підтвердження коду
        // й повторного надсилання
        public const string UnconfirmedEmailAllowed = "UnconfirmedEmailAllowed";
    }
}