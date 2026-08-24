using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Features.Profiles.CreateProfile
{
    public class CreateProfileCommandHandler : IRequestHandler<CreateProfileCommand, MyProfileDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ICurrentUserService _currentUserService;

        public CreateProfileCommandHandler(
            IProfileRepository profileRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _currentUserService = currentUserService;
        }

        public async Task<MyProfileDto> Handle(CreateProfileCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId;

            if (await _profileRepository.ExistsForUserAsync(userId, cancellationToken))
            {
                throw new ConflictException("Профіль для цього користувача вже існує.");
            }

            var profile = new UserProfile
            {
                UserId = userId,
                DisplayName = request.DisplayName,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender
            };

            await _profileRepository.AddAsync(profile, cancellationToken);
            await _profileRepository.SaveChangesAsync(cancellationToken);

            return MapToDto(profile);
        }

        private static MyProfileDto MapToDto(UserProfile profile) => new()
        {
            Id = profile.Id,
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
            IsFaceVerified = profile.IsFaceVerified
        };
    }
}
