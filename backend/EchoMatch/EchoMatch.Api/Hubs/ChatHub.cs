using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace EchoMatch.Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;

        public ChatHub(IProfileRepository profileRepository, IMatchRepository matchRepository)
        {
            _profileRepository = profileRepository;
            _matchRepository = matchRepository;
        }

        public static string GroupFor(Guid matchId) => "match-" + matchId;

        // Група на метч, а не на користувача: подія адресується розмові, і обидва
        // учасники отримують той самий виклик
        public override async Task OnConnectedAsync()
        {
            var myProfileId = await MyProfileIdAsync();

            if (myProfileId is null)
            {
                // Профілю ще немає — підписувати нема на що, але з'єднання живе:
                // клієнт міг під'єднатися під час онбордингу
                await base.OnConnectedAsync();
                return;
            }

            var matchIds = await _matchRepository.GetIdsForProfileAsync(myProfileId.Value, Context.ConnectionAborted);

            foreach (var matchId in matchIds)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, GroupFor(matchId));
            }

            await base.OnConnectedAsync();
        }

        // Для метчів, що виникли вже під час з'єднання: клієнт просить підписку,
        // сервер перевіряє, що він справді учасник
        public async Task JoinMatch(Guid matchId)
        {
            var myProfileId = await MyProfileIdAsync()
                ?? throw new HubException("Профіль ще не створено.");

            var match = await _matchRepository.GetForParticipantAsync(matchId, myProfileId, Context.ConnectionAborted);

            if (match is null)
            {
                throw new HubException("Метч не знайдено.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, GroupFor(matchId));
        }

        // Набір тексту нікуди не зберігається: подія живе стільки, скільки з'єднання
        public async Task Typing(Guid matchId)
        {
            var myProfileId = await MyProfileIdAsync();

            if (myProfileId is null)
            {
                return;
            }

            // Один об'єкт, як і решта подій: додати поле потім можна без правок клієнта
            await Clients
                .OthersInGroup(GroupFor(matchId))
                .SendAsync("PartnerTyping", new ChatTypingEvent(matchId, myProfileId.Value));
        }

        private Task<Guid?> MyProfileIdAsync()
        {
            // Hub не має HttpContext, тож ICurrentUserService тут не працює:
            // claims беруться з Context.User самого з'єднання
            var value = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(value, out var userId)
                ? _profileRepository.GetIdByUserIdAsync(userId, Context.ConnectionAborted)
                : Task.FromResult<Guid?>(null);
        }
    }
}