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

        // Унікальність — серед невидалених, як пари у свайпах і метчах: пошта
        // видаленого акаунта звільняється для нової реєстрації
        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        builder.Property(u => u.PasswordHash);

        builder.Property(u => u.GoogleId)
            .HasMaxLength(64);

        // Власний фільтр замінює той, що EF ставить для nullable-стовпця сам,
        // тож умову IS NOT NULL треба повторити
        builder.HasIndex(u => u.GoogleId)
            .IsUnique()
            .HasFilter("[GoogleId] IS NOT NULL AND [IsDeleted] = 0");

        builder.Property(u => u.Role)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();
    }
}
