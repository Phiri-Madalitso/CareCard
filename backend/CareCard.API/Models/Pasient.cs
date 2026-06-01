namespace CareCard.API.Models
{
    public class Pasient
    {
        public int Id { get; set; }
        public string Fornavn { get; set; } = string.Empty;
        public string Etternavn { get; set; } = string.Empty;
        public string Romnummer { get; set; } = string.Empty;
        public DateTime Fodselsdato { get; set; }
        public string PlassType { get; set; } = string.Empty; // Korttid / Langtid
        public bool ErAktiv { get; set; } = true;
        public int AvdelingId { get; set; }
        public DateTime OpprettetTidspunkt { get; set; } = DateTime.Now;
    }
}
