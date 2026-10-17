using EchoMatch.Application.Features.Events.Common;
using FluentValidation;

namespace EchoMatch.Application.Features.Events.CreateEvent
{
    public class CreateEventCommandValidator : AbstractValidator<CreateEventCommand>
    {
        public CreateEventCommandValidator()
        {
            Include(new EventFieldsValidator<CreateEventCommand>());
        }
    }
}