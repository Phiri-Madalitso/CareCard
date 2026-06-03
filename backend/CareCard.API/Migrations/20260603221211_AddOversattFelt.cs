using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareCard.API.Migrations
{
    /// <inheritdoc />
    public partial class AddOversattFelt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NyVerdiOversatt",
                table: "EndringsForslag",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NyVerdiOversatt",
                table: "EndringsForslag");
        }
    }
}
