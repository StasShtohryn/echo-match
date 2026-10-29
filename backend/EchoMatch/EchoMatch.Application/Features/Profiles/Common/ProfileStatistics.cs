using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Interfaces;

namespace EchoMatch.Application.Features.Profiles.Common
{
    // Статистика для власника профілю. Спільна для перегляду й редагування
    // профілю, щоб обидві відповіді мали ті самі цифри
    public class ProfileStatistics
    {
        private readonly IMatchRepository _matchRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly ISwipeRepository _swipeRepository;

        public ProfileStatistics(
            IMatchRepository matchRepository,
            IMessageRepository messageRepository,
            ISwipeRepository swipeRepository)
        {
            _matchRepository = matchRepository;
            _messageRepository = messageRepository;
            _swipeRepository = swipeRepository;
        }

        public async Task<ProfileStatsDto> ForAsync(Guid profileId, CancellationToken cancellationToken)
        {
            // Той самий підрахунок, що й для значка метчів, щоб цифри не розходились
            var matches = await _matchRepository.CountForProfileAsync(profileId, cancellationToken);
            var messagesSent = await _messageRepository.CountSentAsync(profileId, cancellationToken);
            var likes = await _swipeRepository.CountLikesAsync(profileId, cancellationToken);

            int? mutualPercent = likes.Given == 0
                ? null
                : (int)Math.Round(100.0 * likes.Mutual / likes.Given, MidpointRounding.AwayFromZero);

            return new ProfileStatsDto(matches.Total, messagesSent, likes.Given, likes.Mutual, mutualPercent);
        }
    }
}