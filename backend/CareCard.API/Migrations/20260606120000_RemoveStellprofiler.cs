using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareCard.API.Migrations
{
    public partial class RemoveStellprofiler : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM [EndringsForslag] WHERE [ProfilType] = N'Stellprofil'");
            migrationBuilder.DropTable(name: "Stellprofiler");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stellprofiler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PasientId = table.Column<int>(type: "int", nullable: false),
                    StellPreferanser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Kommunikasjon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ViktigeHensyn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rutiner = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Merknader = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SistEndret = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SistEndretAvId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stellprofiler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Stellprofiler_Pasienter_PasientId",
                        column: x => x.PasientId,
                        principalTable: "Pasienter",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Stellprofiler_PasientId",
                table: "Stellprofiler",
                column: "PasientId",
                unique: true);
        }
    }
}
