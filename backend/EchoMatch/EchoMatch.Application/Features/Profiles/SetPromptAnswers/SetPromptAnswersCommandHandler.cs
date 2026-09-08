using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.SetPromptAnswers
{
    public class SetPromptAnswersCommandHandler
    : IRequestHandler<SetPromptAnswersCommand, IReadOnlyList<PromptAnswerDto>>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ILookupRepository _lookupRepository;
        private readonly ICurrentUserService _currentUserService;

        public SetPromptAnswersCommandHandler(
            IProfileRepository profileRepository,
            ILookupRepository lookupRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _lookupRepository = lookupRepository;
            _currentUserService = currentUserService;
        }

        public async Task<IReadOnlyList<PromptAnswerDto>> Handle(
            SetPromptAnswersCommand request,
            CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdWithPromptAnswersAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var available = (await _lookupRepository.GetActivePromptsAsync(cancellationToken))
                .ToDictionary(prompt => prompt.Id);

            var unknown = request.Answers
                .Select(answer => answer.PromptId)
                .Where(id => !available.ContainsKey(id))
                .ToList();

            if (unknown.Count > 0)
            {
                throw new NotFoundException($"Невідомі питання: {string.Join(", ", unknown)}");
            }

            profile.PromptAnswers.Clear();

            for (var index = 0; index < request.Answers.Count; index++)
            {
                var input = request.Answers[index];

                profile.PromptAnswers.Add(new ProfilePromptAnswer
                {
                    ProfilePromptId = input.PromptId,
                    Answer = input.Answer,
                    Order = index
                });
            }

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return request.Answers
                .Select(answer => new PromptAnswerDto(
                    answer.PromptId,
                    available[answer.PromptId].Code,
                    available[answer.PromptId].Question,
                    answer.Answer))
                .ToList();
        }
    }
}
