using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Features.Events.Common;
using MediatR;

namespace EchoMatch.Application.Features.Events.UploadEventCover
{
    public class UploadEventCoverCommandHandler : IRequestHandler<UploadEventCoverCommand, EventCoverDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IPhotoStorage _photoStorage;
        private readonly ICurrentUserService _currentUserService;

        public UploadEventCoverCommandHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            IPhotoStorage photoStorage,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _photoStorage = photoStorage;
            _currentUserService = currentUserService;
        }

        public async Task<EventCoverDto> Handle(UploadEventCoverCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var @event = (await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)).RequireActive();
            @event.RequireOrganizer(myProfileId);

            var uploaded = await _photoStorage.UploadAsync(request.Content, request.FileName, cancellationToken);

            // Старий файл видаляється вже після збереження: якби база впала,
            // подія лишилась би з посиланням на видалену картинку
            var previousPublicId = @event.CoverPublicId;
            @event.CoverUrl = uploaded.Url;
            @event.CoverPublicId = uploaded.PublicId;

            await _eventRepository.SaveChangesAsync(cancellationToken);

            if (previousPublicId is not null)
            {
                try
                {
                    await _photoStorage.DeleteAsync(previousPublicId, cancellationToken);
                }
                catch (InvalidOperationException)
                {
                    // Нова обкладинка вже збережена; старий файл, що лишився
                    // у сховищі, нікому не видно, і через нього не варто
                    // повертати помилку на успішну заміну
                }
            }

            return new EventCoverDto(uploaded.Url);
        }
    }
}