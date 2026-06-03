using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CareCard.API.Data;
using CareCard.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CareCard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CareCardDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(CareCardDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<TokenDto>> Login(LoginDto login)
        {
            var ansatt = await _context.Ansatte
                .FirstOrDefaultAsync(a => a.Epost == login.Epost && a.ErAktiv);

            if (ansatt == null || !BCrypt.Net.BCrypt.Verify(login.Passord, ansatt.PassordHash))
                return Unauthorized();

            var token = GenerateToken(ansatt);

            return Ok(new TokenDto
            {
                Token = token,
                Navn = $"{ansatt.Fornavn} {ansatt.Etternavn}",
                Rolle = ansatt.Rolle,
                AnsattId = ansatt.Id,
            });
        }

        private string GenerateToken(Models.Ansatt ansatt)
        {
            var jwtKey = _configuration["Jwt:Key"]!;
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];
            var expiresMinutes = int.Parse(_configuration["Jwt:ExpiresInMinutes"] ?? "480");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, ansatt.Id.ToString()),
                new Claim(ClaimTypes.Email, ansatt.Epost),
                new Claim(ClaimTypes.Name, $"{ansatt.Fornavn} {ansatt.Etternavn}"),
                new Claim(ClaimTypes.Role, ansatt.Rolle),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
