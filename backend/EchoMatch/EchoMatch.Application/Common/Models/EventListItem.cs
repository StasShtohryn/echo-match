using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Common.Models
{
    // Подія очима конкретної людини: MyStatus та IsOrganizer залежать від того, хто питає
    public record EventListItem(
        Guid Id,
        string Title,
        int CategoryId,
        string CategoryCode,
        string CategoryName,
        DateTime StartsAt,
        DateTime? EndsAt,
        string City,
        string? PlaceName,
        string? CoverUrl,
        EventJoinPolicy JoinPolicy,
        int? Capacity,
        int ParticipantsCount,
        EventParticipantStatus? MyStatus,
        bool IsOrganizer,
        Guid OrganizerProfileId,
        string OrganizerName,
        string? OrganizerPhotoUrl);

    public record EventDetailsItem(
        EventListItem Card,
        string? Description,
        DateTime? CancelledAt,
        int PendingCount);
}