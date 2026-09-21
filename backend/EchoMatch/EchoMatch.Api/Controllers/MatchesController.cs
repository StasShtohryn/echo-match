using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Matches.GetMatches;
using EchoMatch.Application.Features.Matches.MarkMatchSeen;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    [ApiController]
    [Route("api/matches")]
    public class MatchesController : ControllerBase
    {
        private readonly ISender _sender;

        public MatchesController(ISender sender)
        {
            _sender = sender;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IReadOnlyList<MatchDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IReadOnlyList<MatchDto>>> GetMine(CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetMatchesQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpPost("{id:guid}/seen")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarkSeen(Guid id, CancellationToken cancellationToken)
        {
            await _sender.Send(new MarkMatchSeenCommand(id), cancellationToken);
            return NoContent();
        }
    }
}
