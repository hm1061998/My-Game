using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCaseFiles.Api.Migrations.Sqlite
{
    /// <inheritdoc />
    public partial class ArchiveEncounter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AssistanceUsed",
                table: "PlaySessions",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EncounterCleared",
                table: "PlaySessions",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "EncounterFailures",
                table: "PlaySessions",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "EncounterReceipts",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SubmissionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Outcome = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    AssistanceUsed = table.Column<bool>(type: "INTEGER", nullable: false),
                    RequestedRevision = table.Column<int>(type: "INTEGER", nullable: false),
                    RevisionAfter = table.Column<int>(type: "INTEGER", nullable: false),
                    FailuresAfter = table.Column<int>(type: "INTEGER", nullable: false),
                    ClearedAfter = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EncounterReceipts", x => new { x.SessionId, x.SubmissionId });
                    table.ForeignKey(
                        name: "FK_EncounterReceipts_PlaySessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PlaySessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EncounterReceipts");

            migrationBuilder.DropColumn(
                name: "AssistanceUsed",
                table: "PlaySessions");

            migrationBuilder.DropColumn(
                name: "EncounterCleared",
                table: "PlaySessions");

            migrationBuilder.DropColumn(
                name: "EncounterFailures",
                table: "PlaySessions");
        }
    }
}
