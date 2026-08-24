using EchoMatch.Application.Common.Interfaces;
using System.Security.Claims;

namespace EchoMatch.Api.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid UserId
        {
            get
            {
                var value = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

                return Guid.TryParse(value, out var userId)
                    ? userId
                    : throw new UnauthorizedAccessException("Запит не пов'язаний із автентифікованим користувачем.");
            }
        }
    }
}
