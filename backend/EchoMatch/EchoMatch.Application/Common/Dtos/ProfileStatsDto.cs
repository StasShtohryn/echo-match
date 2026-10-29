namespace EchoMatch.Application.Common.Dtos
{
    // Лише чинне: розірвані метчі, скасовані лайки й видалені співрозмовники
    // не рахуються, тож цифри збігаються з тим, що людина бачить у застосунку.
    // MutualLikesPercent — null, поки людина не поставила жодного лайка
    public record ProfileStatsDto(
        int Matches,
        int MessagesSent,
        int LikesGiven,
        int MutualLikes,
        int? MutualLikesPercent)
    {
        public static ProfileStatsDto Empty { get; } = new(0, 0, 0, 0, null);
    }
}