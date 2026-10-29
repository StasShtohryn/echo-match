namespace EchoMatch.Application.Common.Models
{
    // Mutual — лайки, на які та людина теж відповіла лайком
    public record LikeCounts(int Given, int Mutual);
}