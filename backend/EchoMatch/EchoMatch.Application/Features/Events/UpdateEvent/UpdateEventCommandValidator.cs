using EchoMatch.Application.Features.Events.Common;
using FluentValidation;

namespace EchoMatch.Application.Features.Events.UpdateEvent
{
    public class UpdateEventCommandValidator : AbstractValidator<UpdateEventCommand>
    {
        public UpdateEventCommandValidator()
        {
            Include(new EventFieldsValidator<UpdateEventCommand>());
        }
    }
}