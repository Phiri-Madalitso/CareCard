namespace CareCard.API.Models
{
    public class Stellprofil
    {
        public int Id { get; set; }
        public int PasientId { get; set; }
        public Pasient Pasient { get; set; } = null!;
        public string StellPreferanser { get; set; } = string.Empty;
        public string Kommunikasjon { get; set; } = string.Empty;
        public string ViktigeHensyn { get; set; } = string.Empty;
        public string Rutiner { get; set; } = string.Empty;
        public string Merknader { get; set; } = string.Empty;
        public DateTime SistEndret { get; set; } = DateTime.Now;
        public int SistEndretAvId { get; set; }
    }
}