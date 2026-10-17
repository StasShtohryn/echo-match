using EchoMatch.Domain.Enums;
using System.Diagnostics.CodeAnalysis;

namespace EchoMatch.Application.Common.Dtos
{
    public record EventOrganizerDto(Guid ProfileId, string DisplayName, string? MainPhotoUrl);

    public record EventCardDto
    {
        public required Guid Id { get; init; }
        public required string Title { get; init; }
        public required LookupItemDto Category { get; init; }
        public required DateTime StartsAt { get; init; }
        public required DateTime? EndsAt { get; init; }
        public required string City { get; init; }
        public required string? PlaceName { get; init; }
        public required string? CoverUrl { get; init; }
        public required EventJoinPolicy JoinPolicy { get; init; }
        public required int? Capacity { get; init; }
        public required int ParticipantsCount { get; init; }

        // null — жодного стосунку до події
        public required EventParticipantStatus? MyStatus { get; init; }
        public required bool IsOrganizer { get; init; }
        public required EventOrganizerDto Organizer { get; init; }
    }

    // Картка плюс те, що потрібно лише на сторінці події
    public record EventDetailsDto : EventCardDto
    {
        [SetsRequiredMembers]
        public EventDetailsDto(EventCardDto card) : base(card)
        {
        }

        public string? Description { get; init; }
        public DateTime? CancelledAt { get; init; }

        // Заповнюється лише для організатора
        public int? PendingCount { get; init; }
    }

    public record EventsPageDto(IReadOnlyList<EventCardDto> Items, bool HasMore);

    public record JoinEventResultDto(EventParticipantStatus Status);

    public record EventCoverDto(string CoverUrl);

    public record EventParticipantDto(
        Guid ProfileId,
        string DisplayName,
        int Age,
        string? MainPhotoUrl,
        bool IsFaceVerified,
        EventRole Role);

    public record EventJoinRequestDto(
        Guid ProfileId,
        string DisplayName,
        int Age,
        string? MainPhotoUrl,
        bool IsFaceVerified,
        DateTime RequestedAt);
}