using EchoMatch.Application.Common.Validation;
using EchoMatch.Domain.Entities;
using FluentValidation;

namespace EchoMatch.Application.Features.Messages.SendMessage
{
    public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
    {
        public SendMessageCommandValidator()
        {
            Include(new MessageTextValidator<SendMessageCommand>());
        }
    }
}