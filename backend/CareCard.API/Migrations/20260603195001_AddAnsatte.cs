using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareCard.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAnsatte : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ansatte",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fornavn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Etternavn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Epost = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PassordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rolle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AvdelingId = table.Column<int>(type: "int", nullable: false),
                    ErAktiv = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ansatte", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ansatte_Epost",
                table: "Ansatte",
                column: "Epost",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ansatte");
        }
    }
}
