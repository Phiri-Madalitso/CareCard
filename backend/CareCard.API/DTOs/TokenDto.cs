namespace CareCard.API.DTOs
{
    public class TokenDto
    {
        public string Token { get; set; } = string.Empty;
        public string Navn { get; set; } = string.Empty;
        public string Rolle { get; set; } = string.Empty;
        public int AnsattId { get; set; }
    }
}
