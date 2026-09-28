namespace EchoMatch.Application.Common.Dtos
{
    public record MatchPartnerDto(Guid ProfileId, string DisplayName, int Age, string? MainPhotoUrl);

    public record MatchLastMessageDto(string Text, DateTime SentAt, bool IsMine);

    // LastMessage відсутній, поки ніхто не написав: метч без розмови — теж рядок
    // у списку. UnreadCount рахує лише чужі повідомлення після моєї позначки
    public record MatchDto(
        Guid Id,
        DateTime CreatedAt,
        bool IsNew,
        MatchPartnerDto Partner,
        MatchLastMessageDto? LastMessage,
        int UnreadCount);
}