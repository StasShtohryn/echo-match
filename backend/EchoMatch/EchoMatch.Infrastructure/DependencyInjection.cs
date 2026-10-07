using Anthropic;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Infrastructure.Ai;
using EchoMatch.Infrastructure.Persistence;
using EchoMatch.Infrastructure.Repositories;
using EchoMatch.Infrastructure.Security;
using EchoMatch.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace EchoMatch.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<GoogleAuthSettings>(configuration.GetSection(GoogleAuthSettings.SectionName));

        services.AddScoped<IGoogleTokenValidator, GoogleTokenValidator>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProfileRepository, ProfileRepository>();
        services.AddScoped<ILookupRepository, LookupRepository>();

        services.AddScoped<ISwipeRepository, SwipeRepository>();
        services.AddScoped<IMatchRepository, MatchRepository>();
        services.AddScoped<IDiscoveryRepository, DiscoveryRepository>();

        services.AddScoped<IMessageRepository, MessageRepository>();

        services.Configure<CloudinarySettings>(configuration.GetSection(CloudinarySettings.SectionName));
        services.AddSingleton<IPhotoStorage, CloudinaryPhotoStorage>();

        services.Configure<AiSettings>(configuration.GetSection(AiSettings.SectionName));
        // Клієнт один на застосунок; BaseUrl у налаштуваннях, щоб у перевірках
        // можна було підставити заглушку замість справжнього API
        services.AddSingleton(provider =>
        {
            var settings = provider.GetRequiredService<IOptions<AiSettings>>().Value;

            return new AnthropicClient
            {
                ApiKey = settings.ApiKey,
                BaseUrl = settings.BaseUrl
            };
        });

        services.AddScoped<IAiAssistant, ClaudeAiAssistant>();

        return services;
    }
}
