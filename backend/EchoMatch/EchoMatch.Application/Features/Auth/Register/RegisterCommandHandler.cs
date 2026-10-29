using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Security;
using EchoMatch.Application.Features.Auth.EmailConfirmation;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Auth.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly EmailConfirmationCodes _codes;
    private readonly EmailConfirmationOptions _emailConfirmation;

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        EmailConfirmationCodes codes,
        EmailConfirmationOptions emailConfirmation)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _codes = codes;
        _emailConfirmation = emailConfirmation;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var emailExists = await _userRepository.ExistsByEmailAsync(request.Email, cancellationToken);
        if (emailExists)
        {
            throw new ConflictException("A user with this email already exists.");
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password)
        };

        string? code = null;

        if (_emailConfirmation.Required)
        {
            code = _codes.Issue(user, DateTime.UtcNow);
        }
        else
        {
            user.ConfirmEmail();
        }

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        if (code is not null)
        {
            try
            {
                await _codes.SendAsync(user.Email, code, cancellationToken);
            }
            catch (EmailUnavailableException)
            {
                // Акаунт уже створено: відмова пошти не має перетворювати
                // реєстрацію на помилку. Людина натисне «надіслати ще раз»
            }
        }

        var accessToken = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponseDto(user.Id, user.Email, accessToken, user.IsEmailConfirmed);
    }
}
