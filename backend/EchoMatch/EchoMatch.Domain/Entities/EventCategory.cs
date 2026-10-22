using EchoMatch.Domain.Common;

public class EventCategory : LookupEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}