using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCaseFiles.Api.Migrations.Sqlite
{
    /// <inheritdoc />
    public partial class EvidenceProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EvidenceProgress",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    EvidenceId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    CollectedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ReadAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Bookmarked = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvidenceProgress", x => new { x.SessionId, x.EvidenceId });
                    table.ForeignKey(
                        name: "FK_EvidenceProgress_PlaySessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PlaySessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InteractionReceipts",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SubmissionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    InteractionId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    EvidenceId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    RequestedRevision = table.Column<int>(type: "INTEGER", nullable: false),
                    RevisionAfter = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InteractionReceipts", x => new { x.SessionId, x.SubmissionId });
                    table.ForeignKey(
                        name: "FK_InteractionReceipts_PlaySessions_SessionId",
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
                name: "EvidenceProgress");

            migrationBuilder.DropTable(
                name: "InteractionReceipts");
        }
    }
}
