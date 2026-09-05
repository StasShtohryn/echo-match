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

namespace EchoMatch.Application.Features.Profiles.GetProfileById
{
    public class GetProfileByIdQueryHandler : IRequestHandler<GetProfileByIdQuery, PublicProfileDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetProfileByIdQueryHandler(
            IProfileRepository profileRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _currentUserService = currentUserService;
        }

        public async Task<PublicProfileDto> Handle(GetProfileByIdQuery request, CancellationToken cancellationToken)
        {
            var profile = await _profileRepository.GetByIdAsync(request.Id, cancellationToken);

            if (profile is null || (profile.IsPrivate && profile.UserId != _currentUserService.UserId))
            {
                throw new NotFoundException("Профіль не знайдено.");
            }

            return profile.ToPublicProfileDto();
        }
    }
}
