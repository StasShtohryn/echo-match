using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Messages.GetMessages;
using EchoMatch.Application.Features.Messages.MarkMessagesRead;
using EchoMatch.Application.Features.Messages.RemoveReaction;
using EchoMatch.Application.Features.Messages.SendMessage;
using EchoMatch.Application.Features.Messages.SetReaction;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    [ApiController]
    [Route("api/matches/{matchId:guid}/messages")]
    public class MessagesController : ControllerBase
    {
        private readonly ISender _sender;

        public MessagesController(ISender sender)
        {
            _sender = sender;
        }

        [HttpGet]
        [ProducesResponseType(typeof(MessagePageDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MessagePageDto>> GetPage(
            Guid matchId,
            [FromQuery] long? before,
            [FromQuery] int? limit,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(
                new GetMessagesQuery(matchId, before, limit ?? 30),
                cancellationToken);

            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(MessageDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MessageDto>> Send(
            Guid matchId,
            SendMessageRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new SendMessageCommand(matchId, request.Text), cancellationToken);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPost("read")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarkRead(Guid matchId, CancellationToken cancellationToken)
        {
            await _sender.Send(new MarkMessagesReadCommand(matchId), cancellationToken);
            return NoContent();
        }

        [HttpPut("{messageId:guid}/reaction")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetReaction(
            Guid matchId,
            Guid messageId,
            SetReactionRequest request,
            CancellationToken cancellationToken)
        {
            await _sender.Send(new SetReactionCommand(matchId, messageId, request.Type), cancellationToken);
            return NoContent();
        }

        [HttpDelete("{messageId:guid}/reaction")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveReaction(
            Guid matchId,
            Guid messageId,
            CancellationToken cancellationToken)
        {
            await _sender.Send(new RemoveReactionCommand(matchId, messageId), cancellationToken);
            return NoContent();
        }
    }
}
