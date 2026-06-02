using CareCard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareCard.API.Data
{
    public class CareCardDbContext : DbContext
    {
        public CareCardDbContext(DbContextOptions<CareCardDbContext> options)
            : base(options)
        {
        }

        // Tabeller i databasen
        public DbSet<Pasient> Pasienter { get; set; }
        public DbSet<Matprofil> Matprofiler { get; set; }
        public DbSet<Stellprofil> Stellprofiler { get; set; }
        public DbSet<EndringsForslag> EndringsForslag { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Pasient → Matprofil (én til én)
            modelBuilder.Entity<Matprofil>()
                .HasOne(m => m.Pasient)
                .WithOne()
                .HasForeignKey<Matprofil>(m => m.PasientId);

            // Pasient → Stellprofil (én til én)
            modelBuilder.Entity<Stellprofil>()
                .HasOne(s => s.Pasient)
                .WithOne()
                .HasForeignKey<Stellprofil>(s => s.PasientId);

            // Pasient → EndringsForslag (én til mange)
            modelBuilder.Entity<EndringsForslag>()
                .HasOne(e => e.Pasient)
                .WithMany()
                .HasForeignKey(e => e.PasientId);
        }
    }
}