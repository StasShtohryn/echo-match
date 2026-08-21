using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Lookups.GetLookups;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    [ApiController]
    [Route("api/lookups")]
    public class LookupsController : ControllerBase
    {
        private readonly ISender _sender;

        public LookupsController(ISender sender)
        {
            _sender = sender;
        }

        [HttpGet]
        [ProducesResponseType(typeof(LookupsDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<LookupsDto>> GetAll(CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetLookupsQuery(), cancellationToken);
            return Ok(result);
        }
    }
}
