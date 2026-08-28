

using EchoMatch.Application.Common.Models;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface IGoogleTokenValidator
    {
        Task<GoogleUserInfo> ValidateAsync(string idToken, CancellationToken cancellationToken);
    }
}
