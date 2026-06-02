using CareCard.API.Data;
using CareCard.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareCard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasientController : ControllerBase
    {
        private readonly CareCardDbContext _context;

        public PasientController(CareCardDbContext context)
        {
            _context = context;
        }

        // GET api/pasient
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pasient>>> HentAllePasienter()
        {
            return await _context.Pasienter
                .Where(p => p.ErAktiv)
                .ToListAsync();
        }

        // GET api/pasient/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Pasient>> HentPasient(int id)
        {
            var pasient = await _context.Pasienter.FindAsync(id);

            if (pasient == null)
                return NotFound();

            return pasient;
        }

        // GET api/pasient/avdeling/3
        [HttpGet("avdeling/{avdelingId}")]
        public async Task<ActionResult<IEnumerable<Pasient>>> HentPasienterForAvdeling(int avdelingId)
        {
            return await _context.Pasienter
                .Where(p => p.AvdelingId == avdelingId && p.ErAktiv)
                .ToListAsync();
        }

        // GET api/pasient/søk?navn=astrid
        [HttpGet("søk")]
        public async Task<ActionResult<IEnumerable<Pasient>>> SøkPasient([FromQuery] string navn)
        {
            return await _context.Pasienter
                .Where(p => p.ErAktiv &&
                    (p.Fornavn.Contains(navn) || p.Etternavn.Contains(navn)))
                .ToListAsync();
        }
    }
}