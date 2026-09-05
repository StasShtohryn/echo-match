using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
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

            return profile.ToMyProfileDto();
        }

        
    }
}
