namespace EchoMatch.Infrastructure.Security
{
    public class AiSettings
    {
        public const string SectionName = "Ai";

        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api.anthropic.com";
        public string Model { get; set; } = "claude-sonnet-5-5";

        // Скільки повідомлень історії їде в запит. Уся розмова не влізла б
        // у вікно моделі, а платити за неї довелося б щоразу
        public int MaxHistoryMessages { get; set; } = 50;

        public int MaxTokens { get; set; } = 2000;
        public int SuggestionCount { get; set; } = 3;
    }
}