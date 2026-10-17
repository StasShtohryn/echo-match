using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Features.Events.Common
{
    // Поля, які організатор заповнює і при створенні, і при редагуванні:
    // одні правила перевірки й одне перенесення на сутність для обох команд
    public interface IEventFields
    {
        string Title { get; }
        string? Description { get; }
        int CategoryId { get; }
        DateTime StartsAt { get; }
        DateTime? EndsAt { get; }
        string City { get; }
        string? PlaceName { get; }
        int? Capacity { get; }

        // nullable: пропущене поле інакше прочиталося б як Open, перший член
        // переліку, і опублікувало б подію, яку організатор хотів фільтрувати
        EventJoinPolicy? JoinPolicy { get; }
    }
}