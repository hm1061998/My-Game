using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace OfficeCaseFiles.Api.Infrastructure.Sqlite;

public sealed class DesignTimeGameDbContextFactory : IDesignTimeDbContextFactory<GameDbContext>
{
    public GameDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<GameDbContext>()
            .UseSqlite("Data Source=office-case-files.db")
            .Options;
        return new GameDbContext(options);
    }
}
