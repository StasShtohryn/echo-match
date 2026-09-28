using EchoMatch.Application.Common.Messaging;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Messages.SetReaction
{
    // Тіло запиту: метч і повідомлення приходять з маршруту
    public record SetReactionRequest(ReactionType? Type);

    // Type nullable: пропущене поле інакше прочиталося б як Heart, перший член
    // переліку, і мовчки поставило б реакцію, якої користувач не вибирав
    public record SetReactionCommand(Guid MatchId, Guid MessageId, ReactionType? Type) : ICommand<Unit>;
}