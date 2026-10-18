using EchoMatch.Application.Common.Validation;
using FluentValidation;

namespace EchoMatch.Application.Features.EventMessages.SendEventMessage
{
    public class SendEventMessageCommandValidator : AbstractValidator<SendEventMessageCommand>
    {
        public SendEventMessageCommandValidator()
        {
            Include(new MessageTextValidator<SendEventMessageCommand>());
        }
    }
}