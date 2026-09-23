using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Swipes.CreateSwipe;
using EchoMatch.Application.Features.Swipes.UndoSwipe;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    [ApiController]
    [Route("api/swipes")]
    public class SwipesController : ControllerBase
    {
        private readonly ISender _sender;

        public SwipesController(ISender sender)
        {
            _sender = sender;
        }

        [HttpPost]
        [ProducesResponseType(typeof(SwipeResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<SwipeResultDto>> Create(
            CreateSwipeCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(command, cancellationToken);
            return Ok(result);
        }


        [HttpDelete("{targetProfileId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Undo(Guid targetProfileId, CancellationToken cancellationToken)
        {
            await _sender.Send(new UndoSwipeCommand(targetProfileId), cancellationToken);
            return NoContent();
        }
    }
}