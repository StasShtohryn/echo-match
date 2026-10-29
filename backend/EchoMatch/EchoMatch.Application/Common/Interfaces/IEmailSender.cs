using EchoMatch.Application.Common.Models;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IEmailSender
    {
        Task SendAsync(EmailMessage message, CancellationToken cancellationToken);
    }
}