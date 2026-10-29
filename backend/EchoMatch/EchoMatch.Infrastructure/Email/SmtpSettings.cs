namespace EchoMatch.Infrastructure.Email
{
    public class SmtpSettings
    {
        public const string SectionName = "Smtp";

        public string Host { get; set; } = string.Empty;
        public int Port { get; set; } = 587;

        // Логін у Resend — завжди "resend", він не секрет. Пароль — API-ключ
        // Resend: лише в user-secrets і змінних середовища, як і решта ключів
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public string FromAddress { get; set; } = string.Empty;
        public string FromName { get; set; } = "EchoMatch";

        // Для справжнього провайдера — так. Вимикається лише для заглушки в перевірках
        public bool UseStartTls { get; set; } = true;
    }
}