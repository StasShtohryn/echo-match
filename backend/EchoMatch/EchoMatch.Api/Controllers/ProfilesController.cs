using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Features.Profiles.CreateProfile;
using EchoMatch.Application.Features.Profiles.DeletePhoto;
using EchoMatch.Application.Features.Profiles.GetMyProfile;
using EchoMatch.Application.Features.Profiles.GetProfileById;
using EchoMatch.Application.Features.Profiles.SetInterests;
using EchoMatch.Application.Features.Profiles.SetLanguages;
using EchoMatch.Application.Features.Profiles.SetMainPhoto;
using EchoMatch.Application.Features.Profiles.SetPromptAnswers;
using EchoMatch.Application.Features.Profiles.UpdateProfile;
using EchoMatch.Application.Features.Profiles.UploadPhoto;
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


        [HttpPut("me/interests")]
        [ProducesResponseType(typeof(IReadOnlyList<LookupItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IReadOnlyList<LookupItemDto>>> SetInterests(
            SetInterestsCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPut("me/languages")]
        [ProducesResponseType(typeof(IReadOnlyList<LookupItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IReadOnlyList<LookupItemDto>>> SetLanguages(
            SetLanguagesCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPut("me/prompts")]
        [ProducesResponseType(typeof(IReadOnlyList<PromptAnswerDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IReadOnlyList<PromptAnswerDto>>> SetPromptAnswers(
            SetPromptAnswersCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _sender.Send(command, cancellationToken);
            return Ok(result);
        }


        [HttpPost("me/photos")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(PhotoDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<ActionResult<PhotoDto>> UploadPhoto(IFormFile file, CancellationToken cancellationToken)
        {
            await using var stream = file.OpenReadStream();

            var command = new UploadPhotoCommand(stream, file.FileName, file.ContentType, file.Length);
            var result = await _sender.Send(command, cancellationToken);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpDelete("me/photos/{photoId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePhoto(Guid photoId, CancellationToken cancellationToken)
        {
            await _sender.Send(new DeletePhotoCommand(photoId), cancellationToken);
            return NoContent();
        }

        [HttpPut("me/photos/{photoId:guid}/main")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetMainPhoto(Guid photoId, CancellationToken cancellationToken)
        {
            await _sender.Send(new SetMainPhotoCommand(photoId), cancellationToken);
            return NoContent();
        }
    }
}
