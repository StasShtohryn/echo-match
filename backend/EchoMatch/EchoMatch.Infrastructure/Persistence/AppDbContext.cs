using EchoMatch.Domain.Common;
using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Linq.Expressions;

namespace EchoMatch.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Photo> Photos => Set<Photo>();
    public DbSet<Interest> Interests => Set<Interest>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<ProfilePrompt> ProfilePrompts => Set<ProfilePrompt>();
    public DbSet<ProfilePromptAnswer> ProfilePromptAnswers => Set<ProfilePromptAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(BuildSoftDeleteFilter(entityType.ClrType));
            }
        }

        foreach (var property in modelBuilder.Model.GetEntityTypes()
             .SelectMany(entityType => entityType.GetProperties())
             .Where(property => (Nullable.GetUnderlyingType(property.ClrType) ?? property.ClrType).IsEnum))
        {
            var enumType = Nullable.GetUnderlyingType(property.ClrType) ?? property.ClrType;
            var converterType = typeof(EnumToStringConverter<>).MakeGenericType(enumType);

            property.SetValueConverter((ValueConverter)Activator.CreateInstance(converterType)!);
            property.SetMaxLength(50);
        }

        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    private static LambdaExpression BuildSoftDeleteFilter(Type entityType)
    {
        var parameter = Expression.Parameter(entityType, "e");
        var property = Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
        var condition = Expression.Equal(property, Expression.Constant(false));
        return Expression.Lambda(condition, parameter);
    }
}
