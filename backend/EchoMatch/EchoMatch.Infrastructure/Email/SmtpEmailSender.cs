using System.Net.Sockets;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using MailKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace EchoMatch.Infrastructure.Email
{
    // Звичайний SMTP: провайдер (зараз Resend) змінюється лише налаштуваннями
    public class SmtpEmailSender : IEmailSender
    {
        private readonly SmtpSettings _settings;

        public SmtpEmailSender(IOptions<SmtpSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(_settings.Host) || string.IsNullOrWhiteSpace(_settings.FromAddress))
            {
                throw new InvalidOperationException("Smtp:Host and Smtp:FromAddress are not configured.");
            }

            var mime = new MimeMessage();
            mime.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
            mime.To.Add(MailboxAddress.Parse(message.To));
            mime.Subject = message.Subject;
            mime.Body = new BodyBuilder { HtmlBody = message.HtmlBody, TextBody = message.TextBody }.ToMessageBody();

            using var client = new SmtpClient();

            try
            {
                await client.ConnectAsync(
                    _settings.Host,
                    _settings.Port,
                    _settings.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.None,
                    cancellationToken);

                if (!string.IsNullOrEmpty(_settings.Username))
                {
                    await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);
                }

                await client.SendAsync(mime, cancellationToken);
                await client.DisconnectAsync(true, cancellationToken);
            }
            // Збій чужого сервісу не має виглядати як помилка нашого коду
            catch (Exception exception) when (exception is IOException or SocketException or TimeoutException
                or ProtocolException or CommandException or AuthenticationException or SslHandshakeException)
            {
                throw new EmailUnavailableException($"Не вдалося надіслати лист: {exception.Message}");
            }
        }
    }
}