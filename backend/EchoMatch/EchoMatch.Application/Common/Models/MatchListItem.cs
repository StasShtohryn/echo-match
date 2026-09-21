namespace EchoMatch.Application.Common.Models
{
    // Метч очима одного з учасників: «мій» перегляд і дані другої сторони
    public record MatchListItem(
        Guid Id,
        DateTime CreatedAt,
        DateTime? MySeenAt,
        Guid PartnerProfileId,
        string PartnerName,
        DateOnly PartnerBirthDate,
        string? PartnerPhotoUrl);
}