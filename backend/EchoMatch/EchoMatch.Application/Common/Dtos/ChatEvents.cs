using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Common.Dtos
{
    // Події живого чату. IsMine тут немає навмисно: подія одна для обох
    // учасників, а «моє чи чуже» кожен клієнт визначає сам за SenderProfileId
    public record ChatMessageEvent(
        Guid MatchId,
        Guid Id,
        long Sequence,
        Guid SenderProfileId,
        string Text,
        DateTime SentAt);

    public record ChatReadEvent(Guid MatchId, Guid ReaderProfileId, DateTime ReadAt);

    public record ChatTypingEvent(Guid MatchId, Guid ProfileId);

    // Type == null означає, що реакцію зняли
    public record ChatReactionEvent(Guid MatchId, Guid MessageId, Guid ProfileId, ReactionType? Type);

    // ProfileId — хто розірвав; другий учасник має закрити відкриту розмову
    public record ChatUnmatchedEvent(Guid MatchId, Guid ProfileId);
}