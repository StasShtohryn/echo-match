using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class MatchConfiguration : IEntityTypeConfiguration<Match>
    {
        public void Configure(EntityTypeBuilder<Match> builder)
        {
            builder.ToTable("Matches");

            builder.HasKey(m => m.Id);

            builder.HasOne(m => m.ProfileOne)
                .WithMany()
                .HasForeignKey(m => m.ProfileOneId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(m => m.ProfileTwo)
                .WithMany()
                .HasForeignKey(m => m.ProfileTwoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Пара впорядкована в Match.Between, тож унікальність ловить
            // і (A, B), і (B, A). Фільтр дозволяє зматчитись знову після розриву.
            builder.HasIndex(m => new { m.ProfileOneId, m.ProfileTwoId })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");

            builder.HasIndex(m => m.ProfileTwoId)
                .HasFilter("[IsDeleted] = 0");
        }
    }
}