using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;


namespace EchoMatch.Infrastructure.Security
{
    public class GoogleTokenValidator : IGoogleTokenValidator
    {
        private readonly GoogleAuthSettings _settings;

        public GoogleTokenValidator(IOptions<GoogleAuthSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task<GoogleUserInfo> ValidateAsync(string idToken, CancellationToken cancellationToken)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { _settings.ClientId }
                    });

                return new GoogleUserInfo(payload.Subject, payload.Email, payload.EmailVerified);
            }
            catch (InvalidJwtException)
            {
                throw new UnauthorizedAccessException("Google token is invalid or expired.");
            }
        }
    }
}
