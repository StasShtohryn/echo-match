using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Features.Profiles.Common;
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
        private readonly ProfileStatistics _statistics;
        private readonly ICurrentUserService _currentUserService;

        public GetMyProfileQueryHandler(
            IProfileRepository profileRepository,
            ProfileStatistics statistics,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _statistics = statistics;
            _currentUserService = currentUserService;
        }

        public async Task<MyProfileDto> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
        {
            var profile = await _profileRepository.GetByUserIdWithDetailsAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var stats = await _statistics.ForAsync(profile.Id, cancellationToken);

            return profile.ToMyProfileDto(stats);
        }
    }
}
