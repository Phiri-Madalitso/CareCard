namespace CareCard.API.Models
{
    public class EndringsForslag
    {
        public int Id { get; set; }
        public int PasientId { get; set; }
        public Pasient? Pasient { get; set; }
        public string ProfilType { get; set; } = string.Empty; // Matprofil
        public string FeltNavn { get; set; } = string.Empty;
        public string GammelVerdi { get; set; } = string.Empty;
        public string NyVerdi { get; set; } = string.Empty;
        public string? NyVerdiOversatt { get; set; }
        public string Status { get; set; } = "Venter"; // Venter / Godkjent / Avvist
        public int OpprettetAvId { get; set; }
        public DateTime OpprettetTidspunkt { get; set; } = DateTime.Now;
        public int? BehandletAvId { get; set; }
        public DateTime? BehandletTidspunkt { get; set; }
        public string Kommentar { get; set; } = string.Empty;

        /// <summary>UI-språk ved innsending (no, pt, es …). Sendes fra frontend, lagres ikke.</summary>
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string? KildeSprak { get; set; }
    }
}
