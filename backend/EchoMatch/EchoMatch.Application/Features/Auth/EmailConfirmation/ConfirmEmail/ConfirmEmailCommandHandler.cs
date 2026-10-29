using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Features.Auth.EmailConfirmation;
using FluentValidation;
using FluentValidation.Results;
using MediatR;

namespace EchoMatch.Application.Features.Auth.EmailConfirmation.ConfirmEmail
{
    public class ConfirmEmailCommandHandler : IRequestHandler<ConfirmEmailCommand, AuthResponseDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly EmailConfirmationCodes _codes;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly ICurrentUserService _currentUserService;

        public ConfirmEmailCommandHandler(
            IUserRepository userRepository,
            EmailConfirmationCodes codes,
            IJwtTokenGenerator jwtTokenGenerator,
            ICurrentUserService currentUserService)
        {
            _userRepository = userRepository;
            _codes = codes;
            _jwtTokenGenerator = jwtTokenGenerator;
            _currentUserService = currentUserService;
        }

        public async Task<AuthResponseDto> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Акаунт не знайдено.");

            // Повторний виклик після успіху — не помилка: клієнт просто
            // отримує свіжий токен
            if (!user.IsEmailConfirmed)
            {
                if (user.EmailCodeHash is null || user.EmailCodeExpiresAt < DateTime.UtcNow)
                {
                    throw new ConflictException("Код прострочено — надішліть новий.");
                }

                if (user.EmailCodeAttempts >= EmailConfirmationRules.MaxAttempts)
                {
                    throw new ConflictException("Забагато спроб — надішліть новий код.");
                }

                if (!_codes.Matches(user, request.Code!))
                {
                    // Спробу зараховуємо до відмови, інакше ліміт не діяв би
                    user.RecordFailedEmailCodeAttempt();
                    await _userRepository.SaveChangesAsync(cancellationToken);

                    var left = EmailConfirmationRules.MaxAttempts - user.EmailCodeAttempts;
                    throw new ValidationException([new ValidationFailure("code", $"Невірний код. Лишилося спроб: {left}.")]);
                }

                user.ConfirmEmail();
                await _userRepository.SaveChangesAsync(cancellationToken);
            }

            var accessToken = _jwtTokenGenerator.GenerateToken(user);

            return new AuthResponseDto(user.Id, user.Email, accessToken, user.IsEmailConfirmed);
        }
    }
}