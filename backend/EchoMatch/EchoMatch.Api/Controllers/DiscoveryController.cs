using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Discovery.GetFeed;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    [ApiController]
    [Route("api/discovery")]
    public class DiscoveryController : ControllerBase
    {
        private readonly ISender _sender;

        public DiscoveryController(ISender sender)
        {
            _sender = sender;
        }

        [HttpGet]
        [ProducesResponseType(typeof(DiscoveryFeedDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DiscoveryFeedDto>> GetFeed(
            [FromQuery] int limit = 20,
            CancellationToken cancellationToken = default)
        {
            var result = await _sender.Send(new GetDiscoveryFeedQuery(limit), cancellationToken);
            return Ok(result);
        }
    }
}
