namespace EchoMatch.Application.Common.Models
{
    // Текстова версія — для поштових клієнтів, що не показують HTML
    public record EmailMessage(string To, string Subject, string HtmlBody, string TextBody);
}