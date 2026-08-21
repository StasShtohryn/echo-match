using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Interfaces;
using MediatR;


namespace EchoMatch.Application.Features.Lookups.GetLookups
{
    public class GetLookupsQueryHandler : IRequestHandler<GetLookupsQuery, LookupsDto>
    {
        private readonly ILookupRepository _lookupRepository;

        public GetLookupsQueryHandler(ILookupRepository lookupRepository)
        {
            _lookupRepository = lookupRepository;
        }

        public async Task<LookupsDto> Handle(GetLookupsQuery request, CancellationToken cancellationToken)
        {
            var interests = await  _lookupRepository.GetActiveInterestsAsync(cancellationToken);

            var languages = await _lookupRepository.GetActiveLanguagesAsync(cancellationToken);

            var prompts = await _lookupRepository.GetActivePromptsAsync(cancellationToken);

            return new LookupsDto
            (
                interests.Select(i => new LookupItemDto(i.Id, i.Code, i.Name)).ToList(),
                languages.Select(l => new LookupItemDto(l.Id, l.Code, l.Name)).ToList(),
                prompts.Select(p => new LookupItemDto(p.Id, p.Code, p.Question)).ToList()
            );
        }
    }
}
