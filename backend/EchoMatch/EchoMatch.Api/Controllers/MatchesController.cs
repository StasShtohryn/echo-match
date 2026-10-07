using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Matches.GetCompatibility;
using EchoMatch.Application.Features.Matches.GetMatchCounts;
using EchoMatch.Application.Features.Matches.GetMatches;
using EchoMatch.Application.Features.Matches.MarkMatchSeen;
using EchoMatch.Application.Features.Matches.Unmatch;
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

        [HttpGet("{id:guid}/compatibility")]
        [ProducesResponseType(typeof(MatchCompatibilityDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
        public async Task<ActionResult<MatchCompatibilityDto>> GetCompatibility(
            Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetMatchCompatibilityQuery(id), cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Unmatch(Guid id, CancellationToken cancellationToken)
        {
            await _sender.Send(new UnmatchCommand(id), cancellationToken);
            return NoContent();
        }

        [HttpPost("{id:guid}/seen")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarkSeen(Guid id, CancellationToken cancellationToken)
        {
            await _sender.Send(new MarkMatchSeenCommand(id), cancellationToken);
            return NoContent();
        }


        [HttpGet("count")]
        [ProducesResponseType(typeof(MatchCountsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MatchCountsDto>> GetCounts(CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetMatchCountsQuery(), cancellationToken);
            return Ok(result);
        }
    }
}
