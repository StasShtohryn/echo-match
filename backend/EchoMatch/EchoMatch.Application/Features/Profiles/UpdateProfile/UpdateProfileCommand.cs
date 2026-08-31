using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using EchoMatch.Domain.Enums;


namespace EchoMatch.Application.Features.Profiles.UpdateProfile
{
    public record UpdateProfileCommand : ICommand<MyProfileDto>
    {
        public required string DisplayName { get; init; }
        public required Gender Gender { get; init; }

        public SexualOrientation? Orientation { get; init; }
        public string? Bio { get; init; }
        public string? Occupation { get; init; }
        public string? Company { get; init; }
        public string? School { get; init; }
        public int? HeightCm { get; init; }

        public RelationshipGoal? LookingFor { get; init; }

        public FamilyPlan? FamilyPlans { get; init; }
        public CommunicationStyle? Communication { get; init; }
        public LoveStyle? LoveLanguage { get; init; }
        public PetPreference? Pets { get; init; }
        public DrinkingHabit? Drinking { get; init; }
        public SmokingHabit? Smoking { get; init; }
        public WorkoutHabit? Workout { get; init; }

        public string? InstagramHandle { get; init; }
        public string? SpotifyHandle { get; init; }
    }
}
