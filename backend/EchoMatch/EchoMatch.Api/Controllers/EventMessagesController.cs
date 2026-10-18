using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.EventMessages.GetEventMessages;
using EchoMatch.Application.Features.EventMessages.MarkEventMessagesRead;
using EchoMatch.Application.Features.EventMessages.SendEventMessage;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    [ApiController]
    [Route("api/events/{eventId:guid}/messages")]
    public class EventMessagesController : ControllerBase
    {
        private readonly ISender _sender;

        public EventMessagesController(ISender sender)
        {
            _sender = sender;
        }

        [HttpGet]
        [ProducesResponseType(typeof(EventMessagePageDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EventMessagePageDto>> GetPage(
            Guid eventId,
            [FromQuery] long? before,
            [FromQuery] int? limit,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(
                new GetEventMessagesQuery(eventId, before, limit ?? 30),
                cancellationToken);

            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(EventMessageDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<EventMessageDto>> Send(
            Guid eventId,
            SendEventMessageRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new SendEventMessageCommand(eventId, request.Text), cancellationToken);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPost("read")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarkRead(Guid eventId, CancellationToken cancellationToken)
        {
            await _sender.Send(new MarkEventMessagesReadCommand(eventId), cancellationToken);
            return NoContent();
        }
    }
}