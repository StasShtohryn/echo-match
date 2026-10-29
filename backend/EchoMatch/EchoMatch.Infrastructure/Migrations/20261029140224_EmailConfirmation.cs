using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EchoMatch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EmailConfirmation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmailCodeAttempts",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailCodeExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmailCodeHash",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailCodeSentAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEmailConfirmed",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);
            // Акаунти, що існували до підтвердження пошти, вважаються
            // підтвердженими: інакше з увімкненим підтвердженням усі вони
            // одразу втратили б доступ
            migrationBuilder.Sql("UPDATE [Users] SET [IsEmailConfirmed] = 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailCodeAttempts",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailCodeExpiresAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailCodeHash",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmailCodeSentAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsEmailConfirmed",
                table: "Users");
        }
    }
}
