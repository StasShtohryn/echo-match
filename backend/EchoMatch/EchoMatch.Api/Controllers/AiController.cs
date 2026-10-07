using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Ai.SuggestMessage;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    [ApiController]
    [Route("api/matches/{matchId:guid}/ai")]
    public class AiController : ControllerBase
    {
        private readonly ISender _sender;

        public AiController(ISender sender)
        {
            _sender = sender;
        }

        [HttpPost("suggestions")]
        [ProducesResponseType(typeof(AiSuggestionsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
        public async Task<ActionResult<AiSuggestionsDto>> Suggest(
            Guid matchId,
            SuggestMessageRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(
                new SuggestMessageCommand(matchId, request.Kind, request.Tone, request.Draft),
                cancellationToken);

            return Ok(result);
        }
    }
}