namespace CareCard.API.Models
{
    public class Ansatt
    {
        public int Id { get; set; }
        public string Fornavn { get; set; } = string.Empty;
        public string Etternavn { get; set; } = string.Empty;
        public string Epost { get; set; } = string.Empty;
        public string PassordHash { get; set; } = string.Empty;
        public string Rolle { get; set; } = string.Empty;
        public int AvdelingId { get; set; }
        public bool ErAktiv { get; set; } = true;
    }
}
