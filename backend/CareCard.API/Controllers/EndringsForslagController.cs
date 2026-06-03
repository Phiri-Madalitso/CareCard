using System.Reflection;
using CareCard.API.Data;
using CareCard.API.Models;
using CareCard.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareCard.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EndringsForslagController : ControllerBase
    {
        private readonly CareCardDbContext _context;
        private readonly TranslatorService _translator;

        public EndringsForslagController(CareCardDbContext context, TranslatorService translator)
        {
            _context = context;
            _translator = translator;
        }

        [HttpGet("venter")]
        public async Task<ActionResult<IEnumerable<EndringsForslag>>> HentVentende()
        {
            return await _context.EndringsForslag
                .Where(e => e.Status == "Venter")
                .OrderBy(e => e.OpprettetTidspunkt)
                .Include(e => e.Pasient)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<EndringsForslag>> OpprettForslag(EndringsForslag forslag)
        {
            if (!await _context.Pasienter.AnyAsync(p => p.Id == forslag.PasientId))
                return BadRequest("Ugyldig pasientId.");

            forslag.Pasient = null;
            forslag.OpprettetTidspunkt = DateTime.Now;
            forslag.Status = "Venter";
            forslag.NyVerdiOversatt = await _translator.TranslaterTilNorsk(forslag.NyVerdi);

            _context.EndringsForslag.Add(forslag);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(HentVentende), new { id = forslag.Id }, forslag);
        }

        [Authorize(Roles = "sykepleier,leder")]
        [HttpPut("{id}/godkjenn")]
        public async Task<IActionResult> GodkjennForslag(int id, [FromQuery] int behandletAvId)
        {
            var forslag = await _context.EndringsForslag.FindAsync(id);

            if (forslag == null)
                return NotFound();

            var oppdatert = await ApplyGodkjentForslag(forslag);
            if (!oppdatert)
                return BadRequest("Fant ikke profil å oppdatere.");

            forslag.Status = "Godkjent";
            forslag.BehandletAvId = behandletAvId;
            forslag.BehandletTidspunkt = DateTime.Now;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "sykepleier,leder")]
        [HttpPut("{id}/avvis")]
        public async Task<IActionResult> AvvisForslag(int id, [FromQuery] int behandletAvId, [FromQuery] string kommentar)
        {
            var forslag = await _context.EndringsForslag.FindAsync(id);

            if (forslag == null)
                return NotFound();

            forslag.Status = "Avvist";
            forslag.BehandletAvId = behandletAvId;
            forslag.BehandletTidspunkt = DateTime.Now;
            forslag.Kommentar = kommentar ?? string.Empty;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<bool> ApplyGodkjentForslag(EndringsForslag forslag)
        {
            var verdiTilProfil = forslag.NyVerdiOversatt ?? forslag.NyVerdi;

            if (forslag.ProfilType.Equals("Matprofil", StringComparison.OrdinalIgnoreCase))
            {
                var matprofil = await _context.Matprofiler
                    .FirstOrDefaultAsync(m => m.PasientId == forslag.PasientId);

                if (matprofil == null)
                    return false;

                if (!SetPropertyValue(matprofil, forslag.FeltNavn, verdiTilProfil))
                    return false;

                matprofil.SistEndret = DateTime.Now;
                matprofil.SistEndretAvId = forslag.BehandletAvId ?? forslag.OpprettetAvId;
                return true;
            }

            if (forslag.ProfilType.Equals("Stellprofil", StringComparison.OrdinalIgnoreCase))
            {
                var stellprofil = await _context.Stellprofiler
                    .FirstOrDefaultAsync(s => s.PasientId == forslag.PasientId);

                if (stellprofil == null)
                    return false;

                if (!SetPropertyValue(stellprofil, forslag.FeltNavn, verdiTilProfil))
                    return false;

                stellprofil.SistEndret = DateTime.Now;
                stellprofil.SistEndretAvId = forslag.BehandletAvId ?? forslag.OpprettetAvId;
                return true;
            }

            return false;
        }

        private static bool SetPropertyValue(object target, string feltNavn, string nyVerdi)
        {
            var property = target.GetType().GetProperty(
                feltNavn,
                BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);

            if (property == null || !property.CanWrite || property.PropertyType != typeof(string))
                return false;

            property.SetValue(target, nyVerdi);
            return true;
        }
    }
}
