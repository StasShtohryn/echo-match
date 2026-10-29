using EchoMatch.Application.Common.Behaviors;
using EchoMatch.Application.Features.Auth.EmailConfirmation;
using EchoMatch.Application.Features.Profiles.Common;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace EchoMatch.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));
        services.AddValidatorsFromAssembly(assembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        services.AddScoped<EmailConfirmationCodes>();
        services.AddScoped<ProfileStatistics>();

        return services;
    }
}
