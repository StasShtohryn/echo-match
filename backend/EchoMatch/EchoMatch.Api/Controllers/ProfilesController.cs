using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Profiles.CreateProfile;
using EchoMatch.Application.Features.Profiles.GetMyProfile;
using EchoMatch.Application.Features.Profiles.GetProfileById;
using EchoMatch.Application.Features.Profiles.UpdateProfile;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EchoMatch.Api.Controllers
{
    [ApiController]
    [Route("api/profiles")]
    public class ProfilesController : ControllerBase
    {
        private readonly ISender _sender;

        public ProfilesController(ISender sender)
        {
            _sender = sender;
        }

        [HttpPost]
        [ProducesResponseType(typeof(MyProfileDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<MyProfileDto>> Create(
            CreateProfileCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(command, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, result);
        }


        [HttpGet("me")]
        [ProducesResponseType(typeof(MyProfileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MyProfileDto>> GetMine(CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetMyProfileQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(PublicProfileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PublicProfileDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _sender.Send(new GetProfileByIdQuery(id), cancellationToken);
            return Ok(result);
        }

        [HttpPut("me")]
        [ProducesResponseType(typeof(MyProfileDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MyProfileDto>> UpdateMine(
            UpdateProfileCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(command, cancellationToken);
            return Ok(result);
        }
    }
}
