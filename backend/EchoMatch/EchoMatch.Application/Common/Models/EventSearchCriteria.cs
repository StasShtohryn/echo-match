namespace EchoMatch.Application.Common.Models
{
    // Now — момент, від якого подія вважається майбутньою. Передається ззовні,
    // щоб усі умови одного запиту рахувалися від одного й того самого часу
    public record EventSearchCriteria(
        int? CategoryId,
        string? City,
        string? Search,
        DateTime? From,
        DateTime? To,
        DateTime Now);
}