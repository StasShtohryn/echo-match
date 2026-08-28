using FluentValidation;


namespace EchoMatch.Application.Features.Auth.GoogleSignIn
{
    public class GoogleSignInCommandValidator : AbstractValidator<GoogleSignInCommand>
    {
        public GoogleSignInCommandValidator()
        {
            RuleFor(x => x.IdToken).NotEmpty();
        }
    }
}
