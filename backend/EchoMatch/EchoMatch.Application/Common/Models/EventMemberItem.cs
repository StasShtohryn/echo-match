namespace EchoMatch.Application.Common.Models
{
    // Учасник або заявник: та сама форма, різниться лише статус, за яким вибирали
    public record EventMemberItem(
        Guid ProfileId,
        string DisplayName,
        DateOnly DateOfBirth,
        string? MainPhotoUrl,
        bool IsFaceVerified,
        DateTime JoinedAt);
}