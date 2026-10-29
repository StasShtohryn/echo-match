using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Admin.DeleteUser;
using EchoMatch.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    // Роль приходить у токені, тож нового адміна видно лише після його
    // наступного входу
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public class AdminController : ControllerBase
    {
        private readonly ISender _sender;

        public AdminController(ISender sender)
        {
            _sender = sender;
        }

        [HttpDelete("users")]
        [ProducesResponseType(typeof(UserDeletionResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserDeletionResultDto>> DeleteUser(
            [FromQuery] string? email,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new DeleteUserCommand(email), cancellationToken);
            return Ok(result);
        }
    }
}