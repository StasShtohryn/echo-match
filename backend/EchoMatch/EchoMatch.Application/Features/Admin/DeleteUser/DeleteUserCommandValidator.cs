using FluentValidation;

namespace EchoMatch.Application.Features.Admin.DeleteUser
{
    public class DeleteUserCommandValidator : AbstractValidator<DeleteUserCommand>
    {
        public DeleteUserCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .MaximumLength(256)
                .EmailAddress();
        }
    }
}