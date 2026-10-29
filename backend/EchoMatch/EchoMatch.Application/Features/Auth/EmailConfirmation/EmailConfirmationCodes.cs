using System.Security.Cryptography;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Features.Auth.EmailConfirmation
{
    // Спільне для реєстрації й повторного надсилання: як з'являється код і
    // який вигляд має лист
    public class EmailConfirmationCodes
    {
        private readonly IPasswordHasher _hasher;
        private readonly IEmailSender _emailSender;

        public EmailConfirmationCodes(IPasswordHasher hasher, IEmailSender emailSender)
        {
            _hasher = hasher;
            _emailSender = emailSender;
        }

        // Повертає сам код, щоб його можна було надіслати; у користувача
        // лишається тільки хеш
        public string Issue(User user, DateTime utcNow)
        {
            var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
            user.IssueEmailCode(_hasher.Hash(code), utcNow, EmailConfirmationRules.CodeLifetime);
            return code;
        }

        public bool Matches(User user, string code) =>
            user.EmailCodeHash is not null && _hasher.Verify(code, user.EmailCodeHash);

        public Task SendAsync(string email, string code, CancellationToken cancellationToken)
        {
            var minutes = (int)EmailConfirmationRules.CodeLifetime.TotalMinutes;

            var text =
                $"Ваш код підтвердження EchoMatch: {code}\n\n" +
                $"Він діє {minutes} хвилин. Якщо ви не реєструвалися в EchoMatch, просто проігноруйте цей лист.";

            var html =
                "<div style=\"font-family:Arial,sans-serif;font-size:16px;color:#222\">" +
                "<p>Ваш код підтвердження EchoMatch:</p>" +
                $"<p style=\"font-size:32px;font-weight:bold;letter-spacing:6px\">{code}</p>" +
                $"<p>Він діє {minutes} хвилин. Якщо ви не реєструвалися в EchoMatch, просто проігноруйте цей лист.</p>" +
                "</div>";

            return _emailSender.SendAsync(
                new EmailMessage(email, $"{code} — код підтвердження EchoMatch", html, text),
                cancellationToken);
        }
    }
}