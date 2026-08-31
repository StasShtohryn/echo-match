using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Enums;
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
            {
                Interests = interests.Select(i => new LookupItemDto(i.Id, i.Code, i.Name)).ToList(),
                Languages = languages.Select(l => new LookupItemDto(l.Id, l.Code, l.Name)).ToList(),
                Prompts = prompts.Select(p => new LookupItemDto(p.Id, p.Code, p.Question)).ToList(),
                Options = new EnumOptionsDto
                {
                    Gender = Enum.GetNames<Gender>(),
                    Orientation = Enum.GetNames<SexualOrientation>(),
                    ShowMe = Enum.GetNames<InterestedIn>(),
                    LookingFor = Enum.GetNames<RelationshipGoal>(),
                    FamilyPlans = Enum.GetNames<FamilyPlan>(),
                    Communication = Enum.GetNames<CommunicationStyle>(),
                    LoveLanguage = Enum.GetNames<LoveStyle>(),
                    Pets = Enum.GetNames<PetPreference>(),
                    Drinking = Enum.GetNames<DrinkingHabit>(),
                    Smoking = Enum.GetNames<SmokingHabit>(),
                    Workout = Enum.GetNames<WorkoutHabit>()
                }
            };
        }
    }
}
