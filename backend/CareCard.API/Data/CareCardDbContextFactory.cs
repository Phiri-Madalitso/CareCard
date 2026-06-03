using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace CareCard.API.Data;

public class CareCardDbContextFactory : IDesignTimeDbContextFactory<CareCardDbContext>
{
    public CareCardDbContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddUserSecrets(typeof(CareCardDbContextFactory).Assembly, optional: true)
            .AddEnvironmentVariables()
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<CareCardDbContext>();
        DbContextConfiguration.ConfigureSqlServer(
            optionsBuilder,
            config.GetConnectionString("DefaultConnection"));

        return new CareCardDbContext(optionsBuilder.Options);
    }
}
