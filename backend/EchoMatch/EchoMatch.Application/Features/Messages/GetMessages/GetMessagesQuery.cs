using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Messages.GetMessages
{
    // Before — Sequence найстарішого повідомлення, яке клієнт уже має:
    // сторінки гортаються вглиб історії від курсора, без номера сторінки
    public record GetMessagesQuery(Guid MatchId, long? Before, int Limit = 30) : IQuery<MessagePageDto>;
}