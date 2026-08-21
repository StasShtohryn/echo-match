using EchoMatch.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Common.Interfaces
{
    public interface ILookupRepository
    {
        Task<IReadOnlyList<Interest>> GetActiveInterestsAsync(CancellationToken cancellationToken);
        Task<IReadOnlyList<Language>> GetActiveLanguagesAsync(CancellationToken cancellationToken);
        Task<IReadOnlyList<ProfilePrompt>> GetActivePromptsAsync(CancellationToken cancellationToken);
    }
}
