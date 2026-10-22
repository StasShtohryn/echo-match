using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.EventMessages.GetEventMessages
{
    // Before — Sequence найстарішого повідомлення, яке клієнт уже має, як у чаті метчу
    public record GetEventMessagesQuery(Guid EventId, long? Before, int Limit = 30) : IQuery<EventMessagePageDto>;
}