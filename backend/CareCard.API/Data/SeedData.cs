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
            SeedStellprofiler(context);
            OppdaterManglendeMatprofilFelt(context);
            KorrigerFeilLagretProfiltekst(context);
            SeedAnsatte(context);
            OppdaterAnsattNavn(context);
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
                    KonsistensDrikke = "Nivå 2 – sirupskonsistens. Gjelder all drikke inkludert vann.",
                    HvorSpiser = "Eget rom",
                    Redskap = "Tykt håndtak på bestikk. Sklisikker matte under tallerken.",
                    Misliker = "Fisk (særlig sild), kål, sterk mat, leverpostei.",
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

        private static void SeedStellprofiler(CareCardDbContext context)
        {
            var stellprofiler = new Dictionary<string, Stellprofil>
            {
                ["312"] = new()
                {
                    StellPreferanser = "Foretrekker morgenstell tidlig. Liker å ta det rolig.",
                    Kommunikasjon = "Snakk rolig og tydelig. Gi god tid.",
                    ViktigeHensyn = "Forsiktig ved forflytning. Svak venstre side.",
                    Rutiner = "Hviler etter lunsj. Liker å sitte ute når været tillater det.",
                },
                ["308"] = new()
                {
                    StellPreferanser = "Foretrekker kveldsstell.",
                    Kommunikasjon = "Kommuniserer godt verbalt.",
                    ViktigeHensyn = "Ingen spesielle hensyn.",
                    Rutiner = "Liker å se på TV om kvelden.",
                },
                ["305"] = new()
                {
                    StellPreferanser = "Liker å dusje annenhver dag.",
                    Kommunikasjon = "Trenger tid til å svare, vær tålmodig.",
                    ViktigeHensyn = "Diabetiker – sjekk huden nøye.",
                    Rutiner = "Morgenstell etter frokost.",
                },
                ["314"] = new()
                {
                    StellPreferanser = "Klarer mye selv, gi assistanse ved behov.",
                    Kommunikasjon = "Snakker tydelig, hører dårlig på venstre øre.",
                    ViktigeHensyn = "Allergi mot lateks.",
                    Rutiner = "Dusjed hver morgen.",
                },
            };

            var pasienter = context.Pasienter
                .Where(p => stellprofiler.Keys.Contains(p.Romnummer))
                .ToList();

            var pasienterMedStellprofil = context.Stellprofiler
                .Select(s => s.PasientId)
                .ToHashSet();

            var nyeStellprofiler = new List<Stellprofil>();

            foreach (var pasient in pasienter)
            {
                if (pasienterMedStellprofil.Contains(pasient.Id))
                    continue;

                var stellprofil = stellprofiler[pasient.Romnummer];
                stellprofil.PasientId = pasient.Id;
                nyeStellprofiler.Add(stellprofil);
            }

            if (nyeStellprofiler.Count == 0)
                return;

            context.Stellprofiler.AddRange(nyeStellprofiler);
            context.SaveChanges();
        }

        private static void OppdaterManglendeMatprofilFelt(CareCardDbContext context)
        {
            var ekstraFelt = new Dictionary<string, (string KonsistensDrikke, string Redskap, string Misliker)>
            {
                ["312"] = (
                    "Nivå 2 – sirupskonsistens. Gjelder all drikke inkludert vann.",
                    "Tykt håndtak på bestikk. Sklisikker matte under tallerken.",
                    "Fisk (særlig sild), kål, sterk mat, leverpostei."
                ),
            };

            var pasienter = context.Pasienter
                .Where(p => ekstraFelt.Keys.Contains(p.Romnummer))
                .ToList();

            var endret = false;

            foreach (var pasient in pasienter)
            {
                var matprofil = context.Matprofiler.FirstOrDefault(m => m.PasientId == pasient.Id);
                if (matprofil == null)
                    continue;

                var felt = ekstraFelt[pasient.Romnummer];

                if (string.IsNullOrWhiteSpace(matprofil.KonsistensDrikke))
                {
                    matprofil.KonsistensDrikke = felt.KonsistensDrikke;
                    endret = true;
                }

                if (string.IsNullOrWhiteSpace(matprofil.Redskap))
                {
                    matprofil.Redskap = felt.Redskap;
                    endret = true;
                }

                if (string.IsNullOrWhiteSpace(matprofil.Misliker))
                {
                    matprofil.Misliker = felt.Misliker;
                    endret = true;
                }
            }

            if (endret)
                context.SaveChanges();
        }

        private static void SeedAnsatte(CareCardDbContext context)
        {
            if (context.Ansatte.Any())
                return;

            var passordHash = BCrypt.Net.BCrypt.HashPassword("CareCard123");

            context.Ansatte.AddRange(
                new Ansatt
                {
                    Fornavn = "Kemilly",
                    Etternavn = "Skjelnes",
                    Epost = "ansatt@carecard.no",
                    PassordHash = passordHash,
                    Rolle = "ansatt",
                    AvdelingId = 1,
                },
                new Ansatt
                {
                    Fornavn = "Marit",
                    Etternavn = "Olsen",
                    Epost = "sykepleier@carecard.no",
                    PassordHash = passordHash,
                    Rolle = "sykepleier",
                    AvdelingId = 1,
                },
                new Ansatt
                {
                    Fornavn = "Kari",
                    Etternavn = "Nordmann",
                    Epost = "leder@carecard.no",
                    PassordHash = passordHash,
                    Rolle = "leder",
                    AvdelingId = 1,
                });

            context.SaveChanges();
        }

        private static void OppdaterAnsattNavn(CareCardDbContext context)
        {
            var ansatt = context.Ansatte
                .FirstOrDefault(a => a.Epost == "ansatt@carecard.no");

            if (ansatt == null || ansatt.Fornavn == "Kemilly")
                return;

            ansatt.Fornavn = "Kemilly";
            context.SaveChanges();
        }

        /// <summary>
        /// Retter profilfelt som feilaktig ble lagret på fremmedspråk før godkjenn-fiksen.
        /// </summary>
        private static void KorrigerFeilLagretProfiltekst(CareCardDbContext context)
        {
            var korrektKaffeTe = new Dictionary<string, string>
            {
                ["312"] = "Kaffe med fløte og 1 ts sukker. Aldri svart.",
            };

            var matprofiler = context.Matprofiler
                .Include(m => m.Pasient)
                .Where(m => korrektKaffeTe.Keys.Contains(m.Pasient.Romnummer))
                .ToList();

            var endret = false;
            foreach (var matprofil in matprofiler)
            {
                if (!korrektKaffeTe.TryGetValue(matprofil.Pasient.Romnummer, out var korrekt))
                    continue;

                if (matprofil.KaffeTe == korrekt)
                    continue;

                if (InneholderFremmedsprak(matprofil.KaffeTe))
                {
                    matprofil.KaffeTe = korrekt;
                    endret = true;
                }
            }

            if (endret)
                context.SaveChanges();
        }

        private static bool InneholderFremmedsprak(string tekst)
        {
            if (string.IsNullOrWhiteSpace(tekst))
                return false;

            var lower = tekst.ToLowerInvariant();
            string[] fremmedOrd =
            [
                "azucar", "azúcar", "sin ", "dos ", "pero", "cafe", "café",
                "tea", "sugar", "without", "cukier", "herbata", "bez ",
            ];

            return fremmedOrd.Any(lower.Contains);
        }
    }
}
