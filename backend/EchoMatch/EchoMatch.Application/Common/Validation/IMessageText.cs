namespace EchoMatch.Application.Common.Validation
{
    // Усе, що надсилає текст у чат: повідомлення в метчі й у події
    public interface IMessageText
    {
        string? Text { get; }
    }
}