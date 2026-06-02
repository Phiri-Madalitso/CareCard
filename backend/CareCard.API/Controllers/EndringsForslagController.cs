using CareCard.API.Data;
using CareCard.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareCard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EndringsForslagController : ControllerBase
    {
        private readonly CareCardDbContext _context;

        public EndringsForslagController(CareCardDbContext context)
        {
            _context = context;
        }

        // GET api/endringsforslag/venter
        [HttpGet("venter")]
        public async Task<ActionResult<IEnumerable<EndringsForslag>>> HentVentende()
        {
            return await _context.EndringsForslag
                .Where(e => e.Status == "Venter")
                .OrderBy(e => e.OpprettetTidspunkt)
                .Include(e => e.Pasient)
                .ToListAsync();
        }

        // POST api/endringsforslag
        [HttpPost]
        public async Task<ActionResult<EndringsForslag>> OpprettForslag(EndringsForslag forslag)
        {
            forslag.OpprettetTidspunkt = DateTime.Now;
            forslag.Status = "Venter";

            _context.EndringsForslag.Add(forslag);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(HentVentende), new { id = forslag.Id }, forslag);
        }

        // PUT api/endringsforslag/5/godkjenn
        [HttpPut("{id}/godkjenn")]
        public async Task<IActionResult> GodkjennForslag(int id, [FromQuery] int behandletAvId)
        {
            var forslag = await _context.EndringsForslag.FindAsync(id);

            if (forslag == null)
                return NotFound();

            forslag.Status = "Godkjent";
            forslag.BehandletAvId = behandletAvId;
            forslag.BehandletTidspunkt = DateTime.Now;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT api/endringsforslag/5/avvis
        [HttpPut("{id}/avvis")]
        public async Task<IActionResult> AvvisForslag(int id, [FromQuery] int behandletAvId, [FromQuery] string kommentar)
        {
            var forslag = await _context.EndringsForslag.FindAsync(id);

            if (forslag == null)
                return NotFound();

            forslag.Status = "Avvist";
            forslag.BehandletAvId = behandletAvId;
            forslag.BehandletTidspunkt = DateTime.Now;
            forslag.Kommentar = kommentar;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}