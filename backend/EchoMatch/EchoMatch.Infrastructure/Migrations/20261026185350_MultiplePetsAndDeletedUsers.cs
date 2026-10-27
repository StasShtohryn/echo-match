using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EchoMatch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MultiplePetsAndDeletedUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_GoogleId",
                table: "Users");

            // Одне значення стає масивом з одного: 'Dog' -> '["Dog"]'. Порожні
            // рядки до '[]' доведе сама AlterColumn через defaultValue
            migrationBuilder.Sql(
                "UPDATE [UserProfiles] SET [Pets] = N'[\"' + [Pets] + N'\"]' WHERE [Pets] IS NOT NULL;");

            migrationBuilder.AlterColumn<string>(
                name: "Pets",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Users_GoogleId",
                table: "Users",
                column: "GoogleId",
                unique: true,
                filter: "[GoogleId] IS NOT NULL AND [IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_GoogleId",
                table: "Users");

            // Спершу дозволити NULL: порожній масив стане саме ним
            migrationBuilder.AlterColumn<string>(
                name: "Pets",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldDefaultValue: "[]");

            // Назад лишається тільки перше значення: стовпець знову вміщує одне
            migrationBuilder.Sql(
                "UPDATE [UserProfiles] SET [Pets] = JSON_VALUE([Pets], '$[0]');");

            migrationBuilder.AlterColumn<string>(
                name: "Pets",
                table: "UserProfiles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_GoogleId",
                table: "Users",
                column: "GoogleId",
                unique: true,
                filter: "[GoogleId] IS NOT NULL");
        }
    }
}