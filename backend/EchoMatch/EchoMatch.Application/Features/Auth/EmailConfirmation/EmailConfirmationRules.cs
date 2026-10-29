namespace EchoMatch.Application.Features.Auth.EmailConfirmation
{
    public static class EmailConfirmationRules
    {
        public const int CodeLength = 6;

        // Шість цифр — мільйон варіантів, тож перебір зупиняють термін дії й
        // ліміт спроб, а не довжина коду
        public static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(15);
        public const int MaxAttempts = 5;

        // Щоб кнопка «надіслати ще раз» не перетворилася на розсилку
        public static readonly TimeSpan ResendCooldown = TimeSpan.FromSeconds(60);
    }
}