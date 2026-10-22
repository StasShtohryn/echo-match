using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Events.LeaveEvent
{
    // І вихід учасника, і відкликання ще не розглянутої заявки
    public record LeaveEventCommand(Guid EventId) : ICommand<Unit>;
}