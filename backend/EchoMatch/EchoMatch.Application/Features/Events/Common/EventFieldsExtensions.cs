using EchoMatch.Application.Common.Extensions;
using EchoMatch.Domain.Entities;

namespace EchoMatch.Application.Features.Events.Common
{
    public static class EventFieldsExtensions
    {
        public static void ApplyTo(this IEventFields fields, Event @event)
        {
            @event.Title = fields.Title.Trim();
            @event.Description = NullIfBlank(fields.Description);
            @event.CategoryId = fields.CategoryId;
            @event.StartsAt = fields.StartsAt.AsUtc();
            @event.EndsAt = fields.EndsAt?.AsUtc();
            @event.City = fields.City.Trim();
            @event.PlaceName = NullIfBlank(fields.PlaceName);
            @event.Capacity = fields.Capacity;
            @event.JoinPolicy = fields.JoinPolicy!.Value;
        }

        private static string? NullIfBlank(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}