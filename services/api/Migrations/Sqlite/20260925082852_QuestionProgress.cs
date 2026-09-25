using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OfficeCaseFiles.Api.Migrations.Sqlite
{
    /// <inheritdoc />
    public partial class QuestionProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AnswerReceipts",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SubmissionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuestionId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    ChoiceId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    RequestedRevision = table.Column<int>(type: "INTEGER", nullable: false),
                    RevisionAfter = table.Column<int>(type: "INTEGER", nullable: false),
                    AttemptsAfter = table.Column<int>(type: "INTEGER", nullable: false),
                    IsCorrect = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsPassed = table.Column<bool>(type: "INTEGER", nullable: false),
                    FirstTryCorrect = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnswerReceipts", x => new { x.SessionId, x.SubmissionId });
                    table.ForeignKey(
                        name: "FK_AnswerReceipts_PlaySessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "PlaySessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionProgress",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "TEXT", nullable: false),
                    QuestionId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    FirstChoiceId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Attempts = table.Column<int>(type: "INTEGER", nullable: false),
                    IsPassed = table.Column<bool>(type: "INTEGER", nullable: false),
                    PassedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionProgress", x => new { x.SessionId, x.QuestionId });
                    table.ForeignKey(
                        name: "FK_QuestionProgress_PlaySessions_SessionId",
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
                name: "AnswerReceipts");

            migrationBuilder.DropTable(
                name: "QuestionProgress");
        }
    }
}
