using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Admin.DeleteUser
{
    // Остаточне видалення людини за поштою: усі її акаунти, і чинний, і
    // м'яко видалені раніше, з профілем, фото, свайпами, метчами з усім
    // листуванням, подіями, які вона організувала, і слідами в чужих подіях
    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, UserDeletionResultDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserDataEraser _eraser;
        private readonly IPhotoStorage _photoStorage;
        private readonly ICurrentUserService _currentUserService;

        public DeleteUserCommandHandler(
            IUserRepository userRepository,
            IUserDataEraser eraser,
            IPhotoStorage photoStorage,
            ICurrentUserService currentUserService)
        {
            _userRepository = userRepository;
            _eraser = eraser;
            _photoStorage = photoStorage;
            _currentUserService = currentUserService;
        }

        public async Task<UserDeletionResultDto> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            var userIds = await _userRepository
                .GetIdsByEmailIncludingDeletedAsync(request.Email!.Trim(), cancellationToken);

            if (userIds.Count == 0)
            {
                throw new NotFoundException("Акаунтів із такою поштою немає.");
            }

            // Адмін, що стер себе, лишився б із чинним токеном від акаунта,
            // якого вже немає
            if (userIds.Contains(_currentUserService.UserId))
            {
                throw new ConflictException("Власний акаунт так видалити не можна.");
            }

            var files = await _eraser.EraseAsync(userIds, cancellationToken);

            // Після бази, а не разом із нею: збій сховища не має повертати
            // людину назад. Те, що не вдалося прибрати, видно в результаті
            var filesNotDeleted = 0;

            foreach (var publicId in files)
            {
                try
                {
                    await _photoStorage.DeleteAsync(publicId, cancellationToken);
                }
                catch (Exception) when (!cancellationToken.IsCancellationRequested)
                {
                    filesNotDeleted++;
                }
            }

            return new UserDeletionResultDto(userIds.Count, filesNotDeleted);
        }
    }
}