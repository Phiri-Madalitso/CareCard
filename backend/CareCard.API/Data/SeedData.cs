using CareCard.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CareCard.API.Data
{
    public static class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new CareCardDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<CareCardDbContext>>());

            SeedPasienter(context);
            SeedMatprofiler(context);
        }

        private static void SeedPasienter(CareCardDbContext context)
        {
            var pasienter = new List<Pasient>
            {
                new() { Fornavn = "Astrid", Etternavn = "Henriksen", Romnummer = "312", PlassType = "Langtid", AvdelingId = 1 },
                new() { Fornavn = "Olav", Etternavn = "Berg", Romnummer = "308", PlassType = "Langtid", AvdelingId = 1 },
                new() { Fornavn = "Inger Lise", Etternavn = "Dahl", Romnummer = "305", PlassType = "Langtid", AvdelingId = 1 },
                new() { Fornavn = "Kåre", Etternavn = "Solberg", Romnummer = "314", PlassType = "Langtid", AvdelingId = 1 },
            };

            var eksisterendeRom = context.Pasienter
                .Select(p => p.Romnummer)
                .ToHashSet();

            var nyePasienter = pasienter
                .Where(p => !eksisterendeRom.Contains(p.Romnummer))
                .ToList();

            if (nyePasienter.Count == 0)
                return;

            context.Pasienter.AddRange(nyePasienter);
            context.SaveChanges();
        }

        private static void SeedMatprofiler(CareCardDbContext context)
        {
            var matprofiler = new Dictionary<string, Matprofil>
            {
                ["312"] = new()
                {
                    Allergier = "Nøtter (alle typer), Skalldyr",
                    KaffeTe = "Kaffe med fløte og 1 ts sukker. Aldri svart.",
                    Drikke = "Helst saft. Liker eplejuice til middag.",
                    Frokost = "Brødskive med brunost og syltetøy. Halvgrov skive, smør.",
                    Kvelds = "Lett kveldsmat – grøt eller en skive med ost.",
                    KonsistensMat = "Findelt",
                    HvorSpiser = "Eget rom",
                    ErDiabetiker = false,
                    HarFortykningIDrikke = true,
                },
                ["308"] = new()
                {
                    Allergier = "",
                    KaffeTe = "Svart kaffe",
                    Drikke = "Kefir, juice, kullsyrevann",
                    Frokost = "4 halve grove skiver, variert pålegg.",
                    Kvelds = "Som frokost",
                    KonsistensMat = "Normal",
                    HvorSpiser = "Fellesstue",
                    ErDiabetiker = false,
                    HarFortykningIDrikke = false,
                },
                ["305"] = new()
                {
                    Allergier = "",
                    KaffeTe = "Svart kaffe",
                    Drikke = "Juice, kefir/melk",
                    Frokost = "3 halve skiver med brunost, variert pålegg.",
                    Kvelds = "Som frokost",
                    KonsistensMat = "Normal",
                    HvorSpiser = "Fellesstue",
                    ErDiabetiker = true,
                    HarFortykningIDrikke = false,
                },
                ["314"] = new()
                {
                    Allergier = "Reker, skalldyr, litt reaksjon på kylling",
                    KaffeTe = "Svart kaffe",
                    Drikke = "Kefir, juice, kullsyrevann",
                    Frokost = "4 halve grove skiver, variert pålegg.",
                    Kvelds = "Som frokost",
                    KonsistensMat = "Normal",
                    HvorSpiser = "Fellesstue",
                    ErDiabetiker = false,
                    HarFortykningIDrikke = false,
                },
            };

            var pasienter = context.Pasienter
                .Where(p => matprofiler.Keys.Contains(p.Romnummer))
                .ToList();

            var pasienterMedMatprofil = context.Matprofiler
                .Select(m => m.PasientId)
                .ToHashSet();

            var nyeMatprofiler = new List<Matprofil>();

            foreach (var pasient in pasienter)
            {
                if (pasienterMedMatprofil.Contains(pasient.Id))
                    continue;

                var matprofil = matprofiler[pasient.Romnummer];
                matprofil.PasientId = pasient.Id;
                nyeMatprofiler.Add(matprofil);
            }

            if (nyeMatprofiler.Count == 0)
                return;

            context.Matprofiler.AddRange(nyeMatprofiler);
            context.SaveChanges();
        }
    }
}
