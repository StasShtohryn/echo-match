using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Common.Mappings
{
    public static class EventMappings
    {
        public static EventCardDto ToCardDto(this EventListItem item) => new()
        {
            Id = item.Id,
            Title = item.Title,
            Category = new LookupItemDto(item.CategoryId, item.CategoryCode, item.CategoryName),
            StartsAt = DateTime.SpecifyKind(item.StartsAt, DateTimeKind.Utc),
            EndsAt = item.EndsAt is { } endsAt ? DateTime.SpecifyKind(endsAt, DateTimeKind.Utc) : null,
            City = item.City,
            PlaceName = item.PlaceName,
            CoverUrl = item.CoverUrl,
            JoinPolicy = item.JoinPolicy,
            Capacity = item.Capacity,
            ParticipantsCount = item.ParticipantsCount,
            MyStatus = item.MyStatus,
            IsOrganizer = item.IsOrganizer,
            Organizer = new EventOrganizerDto(item.OrganizerProfileId, item.OrganizerName, item.OrganizerPhotoUrl)
        };

        public static EventDetailsDto ToDetailsDto(this EventDetailsItem item) => new(item.Card.ToCardDto())
        {
            Description = item.Description,
            CancelledAt = item.CancelledAt is { } cancelledAt
                ? DateTime.SpecifyKind(cancelledAt, DateTimeKind.Utc)
                : null,

            // Скільки людей чекає рішення, знає лише той, хто вирішує
            PendingCount = item.Card.IsOrganizer ? item.PendingCount : null
        };

        public static EventParticipantDto ToParticipantDto(
            this EventMemberItem member,
            Guid organizerProfileId,
            DateOnly today) => new(
                member.ProfileId,
                member.DisplayName,
                UserProfile.AgeOn(member.DateOfBirth, today),
                member.MainPhotoUrl,
                member.IsFaceVerified,
                member.ProfileId == organizerProfileId ? EventRole.Organizer : EventRole.Member);

        public static EventJoinRequestDto ToJoinRequestDto(this EventMemberItem member, DateOnly today) => new(
            member.ProfileId,
            member.DisplayName,
            UserProfile.AgeOn(member.DateOfBirth, today),
            member.MainPhotoUrl,
            member.IsFaceVerified,
            DateTime.SpecifyKind(member.JoinedAt, DateTimeKind.Utc));
    }
}