using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;


namespace EchoMatch.Application.Features.Profiles.SetLanguages
{
    public record SetLanguagesCommand(IReadOnlyList<int> LanguageIds)
    : ICommand<IReadOnlyList<LookupItemDto>>;
}
