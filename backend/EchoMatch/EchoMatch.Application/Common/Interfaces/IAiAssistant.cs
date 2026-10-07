using EchoMatch.Application.Common.Models;

namespace EchoMatch.Application.Common.Interfaces
{
    // Модель лишається деталлю інфраструктури: Application знає лише, що існує
    // помічник, який на контекст відповідає кількома варіантами тексту
    public interface IAiAssistant
    {
        Task<IReadOnlyList<string>> SuggestAsync(
            AiSuggestionContext context,
            CancellationToken cancellationToken);

        Task<string> SummariseCompatibilityAsync(
            AiCompatibilityContext context,
            CancellationToken cancellationToken);
    }
}