using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EchoMatch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Compatibility : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompatibilitySummary",
                table: "Matches",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompatibilitySummary",
                table: "Matches");
        }
    }
}
