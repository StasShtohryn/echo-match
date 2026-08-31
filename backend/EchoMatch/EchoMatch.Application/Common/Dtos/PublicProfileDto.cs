using EchoMatch.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Common.Dtos
{
    public record PublicProfileDto
    {
        public required Guid Id { get; init; }
        public required string DisplayName { get; init; }
        public required int Age { get; init; }
        public required Gender Gender { get; init; }
        public required ZodiacSign Zodiac { get; init; }

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

        public required bool IsFaceVerified { get; init; }
    }
}
