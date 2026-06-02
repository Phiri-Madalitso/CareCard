namespace CareCard.API.Models
{
    public class Matprofil
    {
        public int Id { get; set; }
        public int PasientId { get; set; }
        public Pasient Pasient { get; set; } = null!;
        public string Favorittmat { get; set; } = string.Empty;
        public string Misliker { get; set; } = string.Empty;
        public string Allergier { get; set; } = string.Empty;
        public string KaffeTe { get; set; } = string.Empty;
        public string Drikke { get; set; } = string.Empty;
        public string Frokost { get; set; } = string.Empty;
        public string Kvelds { get; set; } = string.Empty;
        public string Mellommaltid { get; set; } = string.Empty;
        public string Redskap { get; set; } = string.Empty;
        public string KonsistensMat { get; set; } = string.Empty;
        public string KonsistensDrikke { get; set; } = string.Empty;
        public string HvorSpiser { get; set; } = string.Empty;
        public bool ErDiabetiker { get; set; } = false;
        public bool HarFortykningIDrikke { get; set; } = false;
        public string Merknader { get; set; } = string.Empty;
        public DateTime SistEndret { get; set; } = DateTime.Now;
        public int SistEndretAvId { get; set; }
    }
}