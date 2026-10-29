using EchoMatch.Api.Security;
using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Auth.EmailConfirmation.ConfirmEmail;
using EchoMatch.Application.Features.Auth.EmailConfirmation.ResendEmailCode;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    // Окремо від AuthController: там [AllowAnonymous] на весь клас, а тут
    // потрібен вхід — але без вимоги вже підтвердженої пошти
    [ApiController]
    [Route("api/auth")]
    [Authorize(Policy = AuthPolicies.UnconfirmedEmailAllowed)]
    public class EmailConfirmationController : ControllerBase
    {
        private readonly ISender _sender;

        public EmailConfirmationController(ISender sender)
        {
            _sender = sender;
        }

        [HttpPost("confirm-email")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<AuthResponseDto>> ConfirmEmail(
            ConfirmEmailCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPost("resend-code")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
        public async Task<IActionResult> ResendCode(CancellationToken cancellationToken)
        {
            await _sender.Send(new ResendEmailCodeCommand(), cancellationToken);
            return NoContent();
        }
    }
}