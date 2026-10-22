namespace EchoMatch.Application.Common.Extensions
{
    public static class DateTimeExtensions
    {
        // Час без зони вважається UTC: фронт надсилає його через toISOString.
        // Прочитати його як місцевий означало б зсунути подію на різницю між
        // поясом сервера й UTC, а на Azure і локально ця різниця різна
        public static DateTime AsUtc(this DateTime value) => value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }
}