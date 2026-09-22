namespace EchoMatch.Application.Common.Dtos
{
    public record MatchPartnerDto(Guid ProfileId, string DisplayName, int Age, string? MainPhotoUrl);

    public record MatchDto(Guid Id, DateTime CreatedAt, bool IsNew, MatchPartnerDto Partner);
}