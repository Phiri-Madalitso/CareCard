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

    [HttpPost]
    public async Task<ActionResult<OversettResponse>> Oversett(OversettRequest request)
    {
        if (request.Tekster == null || request.Tekster.Count == 0)
            return BadRequest("Tekster kan ikke være tom.");

        if (string.IsNullOrWhiteSpace(request.MalSprak))
            return BadRequest("MalSprak må oppgis.");

        var oversatt = await _translator.OversettFraNorsk(request.Tekster, request.MalSprak);

        return Ok(new OversettResponse { Tekster = oversatt.ToList() });
    }
}
