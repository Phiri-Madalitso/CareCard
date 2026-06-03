namespace CareCard.API.DTOs;

public class OversettRequest
{
    public List<string> Tekster { get; set; } = [];
    public string MalSprak { get; set; } = string.Empty;
}

public class OversettResponse
{
    public List<string> Tekster { get; set; } = [];
}
