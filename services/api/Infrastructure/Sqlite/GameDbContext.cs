using Microsoft.EntityFrameworkCore;

namespace OfficeCaseFiles.Api.Infrastructure.Sqlite;

public sealed class GameDbContext(DbContextOptions<GameDbContext> options) : DbContext(options)
{
    public DbSet<SessionRow> Sessions => Set<SessionRow>();
    public DbSet<EvidenceRow> Evidence => Set<EvidenceRow>();
    public DbSet<InteractionReceiptRow> InteractionReceipts => Set<InteractionReceiptRow>();

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
    }
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
}
