using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EchoMatch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FaceVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFaceVerified",
                table: "UserProfiles");

            migrationBuilder.AddColumn<string>(
                name: "FaceLivenessSessionId",
                table: "UserProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FaceVerifiedAt",
                table: "Photos",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FaceLivenessSessionId",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "FaceVerifiedAt",
                table: "Photos");

            migrationBuilder.AddColumn<bool>(
                name: "IsFaceVerified",
                table: "UserProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
