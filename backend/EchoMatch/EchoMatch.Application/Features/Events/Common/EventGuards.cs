using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Features.Events.Common
{
    public static class EventGuards
    {
        // Скасована подія для дій над нею вже не існує: записатися, змінити
        // чи вирішити заявку на неї не можна
        public static Event RequireActive(this Event? @event) =>
            @event is null || @event.CancelledAt is not null
                ? throw new NotFoundException("Подію не знайдено.")
                : @event;

        public static void RequireOrganizer(this Event @event, Guid profileId)
        {
            if (!@event.IsOrganizedBy(profileId))
            {
                throw new ForbiddenException("Це може зробити лише організатор.");
            }
        }
    }
}