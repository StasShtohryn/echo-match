using FluentValidation;

namespace EchoMatch.Application.Features.Discovery.GetFeed
{
    public class GetDiscoveryFeedQueryValidator : AbstractValidator<GetDiscoveryFeedQuery>
    {
        public const int MaxLimit = 50;

        public GetDiscoveryFeedQueryValidator()
        {
            RuleFor(x => x.Limit)
                .InclusiveBetween(1, MaxLimit)
                .WithMessage($"Розмір порції — від 1 до {MaxLimit}.");
        }
    }
}