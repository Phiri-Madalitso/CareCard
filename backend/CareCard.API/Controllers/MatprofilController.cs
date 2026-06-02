using CareCard.API.Data;
using CareCard.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareCard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatprofilController : ControllerBase
    {
        private readonly CareCardDbContext _context;

        public MatprofilController(CareCardDbContext context)
        {
            _context = context;
        }

        // GET api/matprofil/pasient/5
        [HttpGet("pasient/{pasientId}")]
        public async Task<ActionResult<Matprofil>> HentMatprofil(int pasientId)
        {
            var matprofil = await _context.Matprofiler
                .FirstOrDefaultAsync(m => m.PasientId == pasientId);

            if (matprofil == null)
                return NotFound();

            return matprofil;
        }

        // PUT api/matprofil/5
        [HttpPut("{id}")]
        public async Task<IActionResult> OppdaterMatprofil(int id, Matprofil matprofil)
        {
            if (id != matprofil.Id)
                return BadRequest();

            matprofil.SistEndret = DateTime.Now;
            _context.Entry(matprofil).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}