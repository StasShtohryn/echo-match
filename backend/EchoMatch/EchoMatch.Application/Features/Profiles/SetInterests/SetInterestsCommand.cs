using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Profiles.SetInterests
{
    public record SetInterestsCommand(IReadOnlyList<int> InterestIds)
    : ICommand<IReadOnlyList<LookupItemDto>>;
}
