using EchoMatch.Application.Common.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Security
{
    // Звичайна відмова в доступі — порожня 403. Для непідтвердженої пошти
    // клієнт має знати причину, щоб повести людину на екран коду
    public class EmailConfirmationResultHandler : IAuthorizationMiddlewareResultHandler
    {
        private readonly AuthorizationMiddlewareResultHandler _default = new();

        public async Task HandleAsync(
            RequestDelegate next,
            HttpContext context,
            AuthorizationPolicy policy,
            PolicyAuthorizationResult authorizeResult)
        {
            var emailNotConfirmed = authorizeResult.Forbidden
                && authorizeResult.AuthorizationFailure?.FailedRequirements
                    .OfType<ClaimsAuthorizationRequirement>()
                    .Any(requirement => requirement.ClaimType == AuthClaims.EmailVerified) == true;

            if (!emailNotConfirmed)
            {
                await _default.HandleAsync(next, context, policy, authorizeResult);
                return;
            }

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = StatusCodes.Status403Forbidden,
                Title = "Email not confirmed",
                Detail = "Підтвердіть пошту кодом із листа."
            });
        }
    }
}