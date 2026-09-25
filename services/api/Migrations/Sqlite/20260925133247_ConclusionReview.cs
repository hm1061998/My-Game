using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCaseFiles.Api.Migrations.Sqlite
{
    /// <inheritdoc />
    public partial class ConclusionReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConclusionReceipts",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SubmissionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SuspectId = table.Column<string>(type: "TEXT", nullable: false),
                    ReasonId = table.Column<string>(type: "TEXT", nullable: false),
                    EvidenceId1 = table.Column<string>(type: "TEXT", nullable: false),
                    EvidenceId2 = table.Column<string>(type: "TEXT", nullable: false),
                    RequestedRevision = table.Column<int>(type: "INTEGER", nullable: false),
                    RevisionAfter = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConclusionReceipts", x => new { x.SessionId, x.SubmissionId });
                    table.ForeignKey(
                        name: "FK_ConclusionReceipts_PlaySessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PlaySessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Conclusions",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SuspectId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    ReasonId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    EvidenceId1 = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    EvidenceId2 = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    ReadingScore = table.Column<int>(type: "INTEGER", nullable: false),
                    InvestigationScore = table.Column<int>(type: "INTEGER", nullable: false),
                    Revision = table.Column<int>(type: "INTEGER", nullable: false),
                    SubmittedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conclusions", x => x.SessionId);
                    table.ForeignKey(
                        name: "FK_Conclusions_PlaySessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PlaySessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReviewProgress",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ReviewItemId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Attempts = table.Column<int>(type: "INTEGER", nullable: false),
                    IsCompleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewProgress", x => new { x.SessionId, x.ReviewItemId });
                    table.ForeignKey(
                        name: "FK_ReviewProgress_PlaySessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PlaySessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReviewReceipts",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SubmissionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ReviewItemId = table.Column<string>(type: "TEXT", nullable: false),
                    ChoiceId = table.Column<string>(type: "TEXT", nullable: false),
                    RequestedRevision = table.Column<int>(type: "INTEGER", nullable: false),
                    RevisionAfter = table.Column<int>(type: "INTEGER", nullable: false),
                    AttemptsAfter = table.Column<int>(type: "INTEGER", nullable: false),
                    IsCorrect = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsCompleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewReceipts", x => new { x.SessionId, x.SubmissionId });
                    table.ForeignKey(
                        name: "FK_ReviewReceipts_PlaySessions_SessionId",
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
                name: "ConclusionReceipts");

            migrationBuilder.DropTable(
                name: "Conclusions");

            migrationBuilder.DropTable(
                name: "ReviewProgress");

            migrationBuilder.DropTable(
                name: "ReviewReceipts");
        }
    }
}
