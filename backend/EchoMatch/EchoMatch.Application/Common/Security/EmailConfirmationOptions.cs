namespace EchoMatch.Application.Common.Security
{
    public class EmailConfirmationOptions
    {
        public const string SectionName = "EmailConfirmation";

        // false — нові акаунти одразу підтверджені, лист не надсилається, і
        // доступ не залежить від пошти. Вимикач на випадок, коли пошта не працює
        public bool Required { get; set; }
    }
}