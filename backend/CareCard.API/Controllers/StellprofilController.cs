using CareCard.API.Data;
using CareCard.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareCard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StellprofilController : ControllerBase
    {
        private readonly CareCardDbContext _context;

        public StellprofilController(CareCardDbContext context)
        {
            _context = context;
        }

        [HttpGet("pasient/{pasientId}")]
        public async Task<ActionResult<Stellprofil>> HentStellprofil(int pasientId)
        {
            var stellprofil = await _context.Stellprofiler
                .FirstOrDefaultAsync(s => s.PasientId == pasientId);

            if (stellprofil == null)
                return NotFound();

            return stellprofil;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> OppdaterStellprofil(int id, Stellprofil stellprofil)
        {
            if (id != stellprofil.Id)
                return BadRequest();

            stellprofil.SistEndret = DateTime.Now;
            _context.Entry(stellprofil).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
