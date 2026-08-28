using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PasswordHash);

        builder.Property(u => u.GoogleId)
            .HasMaxLength(64);

        builder.HasIndex(u => u.GoogleId)
            .IsUnique();

        builder.Property(u => u.Role)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();
    }
}
