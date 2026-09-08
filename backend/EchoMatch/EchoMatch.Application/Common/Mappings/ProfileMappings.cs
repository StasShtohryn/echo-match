using EchoMatch.Application.Common.Dtos;
using EchoMatch.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Common.Mappings
{
    public static class ProfileMappings
    {
        public static MyProfileDto ToMyProfileDto(this UserProfile profile) => new()
        {
            Id = profile.Id,
            CreatedAt = DateTime.SpecifyKind(profile.CreatedAt, DateTimeKind.Utc),
            DisplayName = profile.DisplayName,
            DateOfBirth = profile.DateOfBirth,
            Age = profile.Age,
            Gender = profile.Gender,
            Zodiac = profile.Zodiac,
            Orientation = profile.Orientation,
            Bio = profile.Bio,
            Occupation = profile.Occupation,
            Company = profile.Company,
            School = profile.School,
            HeightCm = profile.HeightCm,
            ShowMe = profile.ShowMe,
            LookingFor = profile.LookingFor,
            FamilyPlans = profile.FamilyPlans,
            Communication = profile.Communication,
            LoveLanguage = profile.LoveLanguage,
            Pets = profile.Pets,
            Drinking = profile.Drinking,
            Smoking = profile.Smoking,
            Workout = profile.Workout,
            InstagramHandle = profile.InstagramHandle,
            SpotifyHandle = profile.SpotifyHandle,
            IsPrivate = profile.IsPrivate,
            IsFaceVerified = profile.IsFaceVerified,
            IsDiscoverable = profile.IsDiscoverable,

            Photos = profile.Photos
                .OrderBy(photo => photo.Order)
                .Select(photo => new PhotoDto(photo.Id, photo.Url, photo.IsMain, photo.Order))
                .ToList(),

            Interests = profile.Interests
                .Select(link => new LookupItemDto(link.Interest.Id, link.Interest.Code, link.Interest.Name))
                .OrderBy(item => item.Name)
                .ToList(),

            Languages = profile.Languages
                .Select(link => new LookupItemDto(link.Language.Id, link.Language.Code, link.Language.Name))
                .OrderBy(item => item.Name)
                .ToList(),

            PromptAnswers = profile.PromptAnswers
                .OrderBy(answer => answer.Order)
                .Select(answer => new PromptAnswerDto(
                    answer.ProfilePromptId,
                    answer.ProfilePrompt.Code,
                    answer.ProfilePrompt.Question,
                    answer.Answer))
                .ToList()
        };

        public static PublicProfileDto ToPublicProfileDto(this UserProfile profile) => new()
        {
            Id = profile.Id,
            DisplayName = profile.DisplayName,
            Age = profile.Age,
            Gender = profile.Gender,
            Zodiac = profile.Zodiac,
            Orientation = profile.Orientation,
            Bio = profile.Bio,
            Occupation = profile.Occupation,
            Company = profile.Company,
            School = profile.School,
            HeightCm = profile.HeightCm,
            LookingFor = profile.LookingFor,
            FamilyPlans = profile.FamilyPlans,
            Communication = profile.Communication,
            LoveLanguage = profile.LoveLanguage,
            Pets = profile.Pets,
            Drinking = profile.Drinking,
            Smoking = profile.Smoking,
            Workout = profile.Workout,
            InstagramHandle = profile.InstagramHandle,
            SpotifyHandle = profile.SpotifyHandle,
            IsFaceVerified = profile.IsFaceVerified,

            Photos = profile.Photos
                .OrderBy(photo => photo.Order)
                .Select(photo => new PhotoDto(photo.Id, photo.Url, photo.IsMain, photo.Order))
                .ToList(),

            Interests = profile.Interests
                .Select(link => new LookupItemDto(link.Interest.Id, link.Interest.Code, link.Interest.Name))
                .OrderBy(item => item.Name)
                .ToList(),

            Languages = profile.Languages
                .Select(link => new LookupItemDto(link.Language.Id, link.Language.Code, link.Language.Name))
                .OrderBy(item => item.Name)
                .ToList(),

            PromptAnswers = profile.PromptAnswers
                .OrderBy(answer => answer.Order)
                .Select(answer => new PromptAnswerDto(
                    answer.ProfilePromptId,
                    answer.ProfilePrompt.Code,
                    answer.ProfilePrompt.Question,
                    answer.Answer))
                .ToList()
        };
    }
}
