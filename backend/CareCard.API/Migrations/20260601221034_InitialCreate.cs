using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareCard.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Pasienter",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fornavn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Etternavn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Romnummer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Fodselsdato = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlassType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ErAktiv = table.Column<bool>(type: "bit", nullable: false),
                    AvdelingId = table.Column<int>(type: "int", nullable: false),
                    OpprettetTidspunkt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pasienter", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EndringsForslag",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PasientId = table.Column<int>(type: "int", nullable: false),
                    ProfilType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FeltNavn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GammelVerdi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NyVerdi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OpprettetAvId = table.Column<int>(type: "int", nullable: false),
                    OpprettetTidspunkt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BehandletAvId = table.Column<int>(type: "int", nullable: true),
                    BehandletTidspunkt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Kommentar = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EndringsForslag", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EndringsForslag_Pasienter_PasientId",
                        column: x => x.PasientId,
                        principalTable: "Pasienter",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Matprofiler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PasientId = table.Column<int>(type: "int", nullable: false),
                    Favorittmat = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Misliker = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Allergier = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    KaffeTe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Drikke = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Frokost = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Kvelds = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Mellommaltid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Redskap = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    KonsistensMat = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    KonsistensDrikke = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HvorSpiser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ErDiabetiker = table.Column<bool>(type: "bit", nullable: false),
                    HarFortykningIDrikke = table.Column<bool>(type: "bit", nullable: false),
                    Merknader = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SistEndret = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SistEndretAvId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matprofiler", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Matprofiler_Pasienter_PasientId",
                        column: x => x.PasientId,
                        principalTable: "Pasienter",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "IX_EndringsForslag_PasientId",
                table: "EndringsForslag",
                column: "PasientId");

            migrationBuilder.CreateIndex(
                name: "IX_Matprofiler_PasientId",
                table: "Matprofiler",
                column: "PasientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stellprofiler_PasientId",
                table: "Stellprofiler",
                column: "PasientId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EndringsForslag");

            migrationBuilder.DropTable(
                name: "Matprofiler");

            migrationBuilder.DropTable(
                name: "Stellprofiler");

            migrationBuilder.DropTable(
                name: "Pasienter");
        }
    }
}
