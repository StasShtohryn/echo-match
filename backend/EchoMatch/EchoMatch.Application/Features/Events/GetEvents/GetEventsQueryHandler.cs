using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Extensions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Common.Models;
using MediatR;

namespace EchoMatch.Application.Features.Events.GetEvents
{
    public class GetEventsQueryHandler : IRequestHandler<GetEventsQuery, EventsPageDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetEventsQueryHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<EventsPageDto> Handle(GetEventsQuery request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var criteria = new EventSearchCriteria(
                request.CategoryId,
                string.IsNullOrWhiteSpace(request.City) ? null : request.City.Trim(),
                string.IsNullOrWhiteSpace(request.Search) ? null : request.Search.Trim(),
                request.From?.AsUtc(),
                request.To?.AsUtc(),
                DateTime.UtcNow);

            // На один більше, ніж просили: так видно, чи є наступна сторінка,
            // без окремого запиту на загальну кількість
            var items = await _eventRepository.SearchAsync(
                criteria,
                myProfileId,
                (request.Page - 1) * request.Limit,
                request.Limit + 1,
                cancellationToken);

            return new EventsPageDto(
                items.Take(request.Limit).Select(item => item.ToCardDto()).ToList(),
                items.Count > request.Limit);
        }
    }
}