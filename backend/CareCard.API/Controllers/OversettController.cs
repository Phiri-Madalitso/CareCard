using CareCard.API.DTOs;
using CareCard.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareCard.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OversettController : ControllerBase
{
    private readonly TranslatorService _translator;

    public OversettController(TranslatorService translator)
    {
        _translator = translator;
    }

    /// <summary>Sjekk om Azure Translator er konfigurert (f.eks. etter deploy til App Service).</summary>
    [HttpGet("status")]
    public async Task<ActionResult<TranslatorStatus>> Status()
    {
        return Ok(await _translator.HentStatus());
    }

    [HttpPost]
    public async Task<ActionResult<OversettResponse>> Oversett(OversettRequest request)
    {
        if (request.Tekster == null || request.Tekster.Count == 0)
            return BadRequest("Tekster kan ikke være tom.");

        if (string.IsNullOrWhiteSpace(request.MalSprak))
            return BadRequest("MalSprak må oppgis.");

        if (!_translator.ErKonfigurert)
            return StatusCode(503, "Azure Translator er ikke konfigurert på serveren.");

        var oversatt = await _translator.OversettFraNorsk(request.Tekster, request.MalSprak);

        return Ok(new OversettResponse { Tekster = oversatt.ToList() });
    }
}
