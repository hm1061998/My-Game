using Microsoft.EntityFrameworkCore;

namespace OfficeCaseFiles.Api.Infrastructure.Sqlite;

public sealed class GameDbContext(DbContextOptions<GameDbContext> options) : DbContext(options)
{
    public DbSet<SessionRow> Sessions => Set<SessionRow>();
    public DbSet<EvidenceRow> Evidence => Set<EvidenceRow>();
    public DbSet<InteractionReceiptRow> InteractionReceipts => Set<InteractionReceiptRow>();
    public DbSet<QuestionProgressRow> Questions => Set<QuestionProgressRow>();
    public DbSet<AnswerReceiptRow> AnswerReceipts => Set<AnswerReceiptRow>();
    public DbSet<EncounterReceiptRow> EncounterReceipts => Set<EncounterReceiptRow>();
    public DbSet<ConclusionRow> Conclusions => Set<ConclusionRow>();
    public DbSet<ConclusionReceiptRow> ConclusionReceipts => Set<ConclusionReceiptRow>();
    public DbSet<ReviewProgressRow> Reviews => Set<ReviewProgressRow>();
    public DbSet<ReviewReceiptRow> ReviewReceipts => Set<ReviewReceiptRow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var session = modelBuilder.Entity<SessionRow>();
        session.ToTable("PlaySessions");
        session.HasKey(row => row.Id);
        session.HasIndex(row => row.TokenHash).IsUnique();
        session.Property(row => row.TokenHash).IsRequired().HasMaxLength(64);
        session.Property(row => row.CaseId).IsRequired().HasMaxLength(80);
        session.Property(row => row.CaseVersion).IsRequired().HasMaxLength(40);
        session.Property(row => row.Status).IsRequired().HasMaxLength(40);
        session.Property(row => row.MapId).IsRequired().HasMaxLength(80);
        session.Property(row => row.CheckpointId).IsRequired().HasMaxLength(80);

        var evidence = modelBuilder.Entity<EvidenceRow>();
        evidence.ToTable("EvidenceProgress");
        evidence.HasKey(row => new { row.SessionId, row.EvidenceId });
        evidence.HasOne<SessionRow>().WithMany().HasForeignKey(row => row.SessionId).OnDelete(DeleteBehavior.Cascade);
        evidence.Property(row => row.EvidenceId).HasMaxLength(80);

        var receipts = modelBuilder.Entity<InteractionReceiptRow>();
        receipts.ToTable("InteractionReceipts");
        receipts.HasKey(row => new { row.SessionId, row.SubmissionId });
        receipts.HasOne<SessionRow>().WithMany().HasForeignKey(row => row.SessionId).OnDelete(DeleteBehavior.Cascade);
        receipts.Property(row => row.InteractionId).HasMaxLength(80);
        receipts.Property(row => row.EvidenceId).HasMaxLength(80);

        var questions = modelBuilder.Entity<QuestionProgressRow>();
        questions.ToTable("QuestionProgress");
        questions.HasKey(row => new { row.SessionId, row.QuestionId });
        questions.HasOne<SessionRow>().WithMany().HasForeignKey(row => row.SessionId).OnDelete(DeleteBehavior.Cascade);
        questions.Property(row => row.QuestionId).HasMaxLength(80);
        questions.Property(row => row.FirstChoiceId).HasMaxLength(80);

        var answers = modelBuilder.Entity<AnswerReceiptRow>();
        answers.ToTable("AnswerReceipts");
        answers.HasKey(row => new { row.SessionId, row.SubmissionId });
        answers.HasOne<SessionRow>().WithMany().HasForeignKey(row => row.SessionId).OnDelete(DeleteBehavior.Cascade);
        answers.Property(row => row.QuestionId).HasMaxLength(80);
        answers.Property(row => row.ChoiceId).HasMaxLength(80);

        var encounterReceipts = modelBuilder.Entity<EncounterReceiptRow>();
        encounterReceipts.ToTable("EncounterReceipts");
        encounterReceipts.HasKey(row => new { row.SessionId, row.SubmissionId });
        encounterReceipts.HasOne<SessionRow>().WithMany().HasForeignKey(row => row.SessionId).OnDelete(DeleteBehavior.Cascade);
        encounterReceipts.Property(row => row.Outcome).HasMaxLength(20);

        var conclusions = modelBuilder.Entity<ConclusionRow>();
        conclusions.ToTable("Conclusions");
        conclusions.HasKey(row => row.SessionId);
        conclusions.HasOne<SessionRow>().WithOne().HasForeignKey<ConclusionRow>(row => row.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
        conclusions.Property(row => row.SuspectId).HasMaxLength(80);
        conclusions.Property(row => row.ReasonId).HasMaxLength(80);
        conclusions.Property(row => row.EvidenceId1).HasMaxLength(80);
        conclusions.Property(row => row.EvidenceId2).HasMaxLength(80);

        var conclusionReceipts = modelBuilder.Entity<ConclusionReceiptRow>();
        conclusionReceipts.ToTable("ConclusionReceipts");
        conclusionReceipts.HasKey(row => new { row.SessionId, row.SubmissionId });
        conclusionReceipts.HasOne<SessionRow>().WithMany().HasForeignKey(row => row.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        var reviews = modelBuilder.Entity<ReviewProgressRow>();
        reviews.ToTable("ReviewProgress");
        reviews.HasKey(row => new { row.SessionId, row.ReviewItemId });
        reviews.HasOne<SessionRow>().WithMany().HasForeignKey(row => row.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
        reviews.Property(row => row.ReviewItemId).HasMaxLength(80);

        var reviewReceipts = modelBuilder.Entity<ReviewReceiptRow>();
        reviewReceipts.ToTable("ReviewReceipts");
        reviewReceipts.HasKey(row => new { row.SessionId, row.SubmissionId });
        reviewReceipts.HasOne<SessionRow>().WithMany().HasForeignKey(row => row.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ConclusionRow
{
    public Guid SessionId { get; set; }
    public string SuspectId { get; set; } = string.Empty;
    public string ReasonId { get; set; } = string.Empty;
    public string EvidenceId1 { get; set; } = string.Empty;
    public string EvidenceId2 { get; set; } = string.Empty;
    public int ReadingScore { get; set; }
    public int InvestigationScore { get; set; }
    public int Revision { get; set; }
    public DateTime SubmittedAtUtc { get; set; }
}

public sealed class ConclusionReceiptRow
{
    public Guid SessionId { get; set; }
    public Guid SubmissionId { get; set; }
    public string SuspectId { get; set; } = string.Empty;
    public string ReasonId { get; set; } = string.Empty;
    public string EvidenceId1 { get; set; } = string.Empty;
    public string EvidenceId2 { get; set; } = string.Empty;
    public int RequestedRevision { get; set; }
    public int RevisionAfter { get; set; }
}

public sealed class ReviewProgressRow
{
    public Guid SessionId { get; set; }
    public string ReviewItemId { get; set; } = string.Empty;
    public int Attempts { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
}

public sealed class ReviewReceiptRow
{
    public Guid SessionId { get; set; }
    public Guid SubmissionId { get; set; }
    public string ReviewItemId { get; set; } = string.Empty;
    public string ChoiceId { get; set; } = string.Empty;
    public int RequestedRevision { get; set; }
    public int RevisionAfter { get; set; }
    public int AttemptsAfter { get; set; }
    public bool IsCorrect { get; set; }
    public bool IsCompleted { get; set; }
}

public sealed class EncounterReceiptRow
{
    public Guid SessionId { get; set; }
    public Guid SubmissionId { get; set; }
    public string Outcome { get; set; } = string.Empty;
    public bool AssistanceUsed { get; set; }
    public int RequestedRevision { get; set; }
    public int RevisionAfter { get; set; }
    public int FailuresAfter { get; set; }
    public bool ClearedAfter { get; set; }
}

public sealed class QuestionProgressRow
{
    public Guid SessionId { get; set; }
    public string QuestionId { get; set; } = string.Empty;
    public string FirstChoiceId { get; set; } = string.Empty;
    public int Attempts { get; set; }
    public bool IsPassed { get; set; }
    public DateTime? PassedAtUtc { get; set; }
}

public sealed class AnswerReceiptRow
{
    public Guid SessionId { get; set; }
    public Guid SubmissionId { get; set; }
    public string QuestionId { get; set; } = string.Empty;
    public string ChoiceId { get; set; } = string.Empty;
    public int RequestedRevision { get; set; }
    public int RevisionAfter { get; set; }
    public int AttemptsAfter { get; set; }
    public bool IsCorrect { get; set; }
    public bool IsPassed { get; set; }
    public bool FirstTryCorrect { get; set; }
}

public sealed class EvidenceRow
{
    public Guid SessionId { get; set; }
    public string EvidenceId { get; set; } = string.Empty;
    public DateTime CollectedAtUtc { get; set; }
    public DateTime? ReadAtUtc { get; set; }
    public bool Bookmarked { get; set; }
}

public sealed class InteractionReceiptRow
{
    public Guid SessionId { get; set; }
    public Guid SubmissionId { get; set; }
    public string InteractionId { get; set; } = string.Empty;
    public string EvidenceId { get; set; } = string.Empty;
    public int RequestedRevision { get; set; }
    public int RevisionAfter { get; set; }
}

public sealed class SessionRow
{
    public Guid Id { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public string CaseId { get; set; } = string.Empty;
    public string CaseVersion { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Revision { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public string MapId { get; set; } = string.Empty;
    public string CheckpointId { get; set; } = string.Empty;
    public bool EncounterCleared { get; set; }
    public int EncounterFailures { get; set; }
    public bool AssistanceUsed { get; set; }
}
