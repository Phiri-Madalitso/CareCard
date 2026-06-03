using Microsoft.EntityFrameworkCore;

namespace CareCard.API.Data;

public static class DbContextConfiguration
{
    public static void ConfigureSqlServer(DbContextOptionsBuilder options, string? connectionString)
    {
        options.UseSqlServer(
            connectionString,
            sql => sql.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null));
    }
}
