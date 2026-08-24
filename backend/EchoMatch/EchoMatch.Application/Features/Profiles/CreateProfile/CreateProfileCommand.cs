using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using EchoMatch.Domain.Enums;


namespace EchoMatch.Application.Features.Profiles.CreateProfile
{
    public record CreateProfileCommand : ICommand<MyProfileDto>
    {
        public required string DisplayName { get; init; }
        public required DateOnly DateOfBirth { get; init; }
        public required Gender Gender { get; init; }
    }
}
