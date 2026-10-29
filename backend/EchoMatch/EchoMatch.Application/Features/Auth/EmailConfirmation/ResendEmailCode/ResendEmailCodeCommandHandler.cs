using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Features.Auth.EmailConfirmation;
using MediatR;

namespace EchoMatch.Application.Features.Auth.EmailConfirmation.ResendEmailCode
{
    public class ResendEmailCodeCommandHandler : IRequestHandler<ResendEmailCodeCommand, Unit>
    {
        private readonly IUserRepository _userRepository;
        private readonly EmailConfirmationCodes _codes;
        private readonly ICurrentUserService _currentUserService;

        public ResendEmailCodeCommandHandler(
            IUserRepository userRepository,
            EmailConfirmationCodes codes,
            ICurrentUserService currentUserService)
        {
            _userRepository = userRepository;
            _codes = codes;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(ResendEmailCodeCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Акаунт не знайдено.");

            if (user.IsEmailConfirmed)
            {
                throw new ConflictException("Пошту вже підтверджено.");
            }

            var now = DateTime.UtcNow;
            var nextAllowed = user.EmailCodeSentAt + EmailConfirmationRules.ResendCooldown;

            if (nextAllowed > now)
            {
                var seconds = (int)Math.Ceiling((nextAllowed.Value - now).TotalSeconds);
                throw new ConflictException($"Новий код можна надіслати через {seconds} с.");
            }

            var code = _codes.Issue(user, now);
            await _userRepository.SaveChangesAsync(cancellationToken);

            // Відмова пошти тут — відповідь 503: людина чекає саме на лист
            await _codes.SendAsync(user.Email, code, cancellationToken);

            return Unit.Value;
        }
    }
}