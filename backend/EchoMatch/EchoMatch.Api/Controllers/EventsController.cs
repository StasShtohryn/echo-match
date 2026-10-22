using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Events.ApproveJoinRequest;
using EchoMatch.Application.Features.Events.CancelEvent;
using EchoMatch.Application.Features.Events.CreateEvent;
using EchoMatch.Application.Features.Events.GetEvent;
using EchoMatch.Application.Features.Events.GetEvents;
using EchoMatch.Application.Features.Events.GetJoinRequests;
using EchoMatch.Application.Features.Events.GetMyEvents;
using EchoMatch.Application.Features.Events.GetParticipants;
using EchoMatch.Application.Features.Events.JoinEvent;
using EchoMatch.Application.Features.Events.LeaveEvent;
using EchoMatch.Application.Features.Events.RejectJoinRequest;
using EchoMatch.Application.Features.Events.RemoveParticipant;
using EchoMatch.Application.Features.Events.UpdateEvent;
using EchoMatch.Application.Features.Events.UploadEventCover;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    [ApiController]
    [Route("api/events")]
    public class EventsController : ControllerBase
    {
        private readonly ISender _sender;

        public EventsController(ISender sender)
        {
            _sender = sender;
        }

        [HttpGet]
        [ProducesResponseType(typeof(EventsPageDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EventsPageDto>> GetEvents(
            [FromQuery] int? categoryId,
            [FromQuery] string? city,
            [FromQuery] string? search,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20,
            CancellationToken cancellationToken = default)
        {
            var result = await _sender.Send(
                new GetEventsQuery(categoryId, city, search, from, to, page, limit),
                cancellationToken);

            return Ok(result);
        }


        [HttpGet("mine")]
        [ProducesResponseType(typeof(IReadOnlyList<EventMineDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IReadOnlyList<EventMineDto>>> GetMine(CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetMyEventsQuery(), cancellationToken);
            return Ok(result);
        }


        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(EventDetailsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EventDetailsDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetEventQuery(id), cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(EventDetailsDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EventDetailsDto>> Create(
            CreateEventCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(EventDetailsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<EventDetailsDto>> Update(
            Guid id,
            UpdateEventRequest request,
            CancellationToken cancellationToken)
        {
            var command = new UpdateEventCommand(
                id,
                request.Title,
                request.Description,
                request.CategoryId,
                request.StartsAt,
                request.EndsAt,
                request.City,
                request.PlaceName,
                request.Capacity,
                request.JoinPolicy);

            var result = await _sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPut("{id:guid}/cover")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(EventCoverDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EventCoverDto>> UploadCover(
            Guid id,
            IFormFile file,
            CancellationToken cancellationToken)
        {
            await using var stream = file.OpenReadStream();

            var command = new UploadEventCoverCommand(id, stream, file.FileName, file.Length);
            var result = await _sender.Send(command, cancellationToken);

            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
        {
            await _sender.Send(new CancelEventCommand(id), cancellationToken);
            return NoContent();
        }

        [HttpPost("{id:guid}/join")]
        [ProducesResponseType(typeof(JoinEventResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<JoinEventResultDto>> Join(Guid id, CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new JoinEventCommand(id), cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:guid}/join")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Leave(Guid id, CancellationToken cancellationToken)
        {
            await _sender.Send(new LeaveEventCommand(id), cancellationToken);
            return NoContent();
        }

        [HttpGet("{id:guid}/participants")]
        [ProducesResponseType(typeof(IReadOnlyList<EventParticipantDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IReadOnlyList<EventParticipantDto>>> GetParticipants(
            Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetEventParticipantsQuery(id), cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:guid}/participants/{profileId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RemoveParticipant(
            Guid id,
            Guid profileId,
            CancellationToken cancellationToken)
        {
            await _sender.Send(new RemoveParticipantCommand(id, profileId), cancellationToken);
            return NoContent();
        }

        [HttpGet("{id:guid}/requests")]
        [ProducesResponseType(typeof(IReadOnlyList<EventJoinRequestDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IReadOnlyList<EventJoinRequestDto>>> GetJoinRequests(
            Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetJoinRequestsQuery(id), cancellationToken);
            return Ok(result);
        }

        [HttpPost("{id:guid}/requests/{profileId:guid}/approve")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> ApproveJoinRequest(
            Guid id,
            Guid profileId,
            CancellationToken cancellationToken)
        {
            await _sender.Send(new ApproveJoinRequestCommand(id, profileId), cancellationToken);
            return NoContent();
        }

        [HttpPost("{id:guid}/requests/{profileId:guid}/reject")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RejectJoinRequest(
            Guid id,
            Guid profileId,
            CancellationToken cancellationToken)
        {
            await _sender.Send(new RejectJoinRequestCommand(id, profileId), cancellationToken);
            return NoContent();
        }
    }
}