using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Features.Auth.GoogleSignIn
{
    public class GoogleSignInCommandHandler : IRequestHandler<GoogleSignInCommand, AuthResponseDto>
    {
        private readonly IGoogleTokenValidator _googleTokenValidator;
        private readonly IUserRepository _userRepository;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public GoogleSignInCommandHandler(
            IGoogleTokenValidator googleTokenValidator,
            IUserRepository userRepository,
            IJwtTokenGenerator jwtTokenGenerator)
        {
            _googleTokenValidator = googleTokenValidator;
            _userRepository = userRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<AuthResponseDto> Handle(GoogleSignInCommand request, CancellationToken cancellationToken)
        {
            var googleUser = await _googleTokenValidator.ValidateAsync(request.IdToken, cancellationToken);

            if (!googleUser.EmailVerified || string.IsNullOrWhiteSpace(googleUser.Email))
            {
                throw new UnauthorizedAccessException("Google account email is not verified.");
            }

            var user = await _userRepository.GetByGoogleIdAsync(googleUser.Subject, cancellationToken);

            if (user is null)
            {
                user = await _userRepository.GetByEmailAsync(googleUser.Email, cancellationToken);

                if (user is not null)
                {
                    user.GoogleId = googleUser.Subject;
                }
                else
                {
                    user = new User
                    {
                        Email = googleUser.Email,
                        GoogleId = googleUser.Subject
                    };

                    await _userRepository.AddAsync(user, cancellationToken);
                }

                await _userRepository.SaveChangesAsync(cancellationToken);
            }

            var accessToken = _jwtTokenGenerator.GenerateToken(user);

            return new AuthResponseDto(user.Id, user.Email, accessToken);
        }
    }
}
