using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EchoMatch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MatchSeen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "UserProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProfileOneSeenAt",
                table: "Matches",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProfileTwoSeenAt",
                table: "Matches",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "ProfileOneSeenAt",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "ProfileTwoSeenAt",
                table: "Matches");
        }
    }
}
