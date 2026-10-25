namespace EchoMatch.Infrastructure.Security
{
    public class AwsSettings
    {
        public const string SectionName = "Aws";

        // Перевірка «жива людина» доступна не в кожному регіоні; Ірландія — так
        public string Region { get; set; } = "eu-west-1";

        // Ключі — лише в user-secrets і змінних середовища, як і ключ AI
        public string AccessKeyId { get; set; } = string.Empty;
        public string SecretAccessKey { get; set; } = string.Empty;

        // Порожньо — справжній AWS. Для перевірок підставляється адреса заглушки
        public string? ServiceUrl { get; set; }
    }
}