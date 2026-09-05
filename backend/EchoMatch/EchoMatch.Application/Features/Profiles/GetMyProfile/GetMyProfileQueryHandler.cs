using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EchoMatch.Application.Features.Profiles.GetMyProfile
{
    public class GetMyProfileQueryHandler : IRequestHandler<GetMyProfileQuery, MyProfileDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetMyProfileQueryHandler(
            IProfileRepository profileRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _currentUserService = currentUserService;
        }

        public async Task<MyProfileDto> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
        {
            var profile = await _profileRepository.GetByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            return profile.ToMyProfileDto();
        }
    }
}
