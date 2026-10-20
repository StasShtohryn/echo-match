using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;

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

        // Учасників і чат бачать лише ті, хто йде. Скасовану подію стороння
        // людина не бачить зовсім, а учасник бачить — щоб дізнатися про скасування
        public static async Task<(Event Event, EventParticipant Participation)> RequireApprovedParticipantAsync(
            this IEventRepository eventRepository,
            Guid eventId,
            Guid profileId,
            CancellationToken cancellationToken)
        {
            var @event = await eventRepository.GetByIdAsync(eventId, cancellationToken)
                ?? throw new NotFoundException("Подію не знайдено.");

            var participation = await eventRepository.GetParticipationAsync(eventId, profileId, cancellationToken);

            if (@event.CancelledAt is not null && participation is null)
            {
                throw new NotFoundException("Подію не знайдено.");
            }

            if (participation?.Status != EventParticipantStatus.Approved)
            {
                throw new ForbiddenException("Це доступно лише тим, хто йде на подію.");
            }

            return (@event, participation);
        }
    }
}