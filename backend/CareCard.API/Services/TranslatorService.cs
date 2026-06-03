using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace CareCard.API.Services;

public class TranslatorService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TranslatorService> _logger;

    public TranslatorService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<TranslatorService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string?> TranslaterTilNorsk(string tekst)
    {
        if (string.IsNullOrWhiteSpace(tekst))
            return null;

        var key = _configuration["Translator:Key"];
        var endpoint = _configuration["Translator:Endpoint"]
            ?? "https://api.cognitive.microsofttranslator.com/";
        var region = _configuration["Translator:Region"];

        if (string.IsNullOrWhiteSpace(key))
        {
            _logger.LogWarning("Translator:Key is not configured — skipping translation.");
            return null;
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            var baseUrl = endpoint.TrimEnd('/');
            var requestUri = $"{baseUrl}/translate?api-version=3.0&to=nb";

            using var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            request.Headers.Add("Ocp-Apim-Subscription-Key", key);
            if (!string.IsNullOrWhiteSpace(region))
                request.Headers.Add("Ocp-Apim-Subscription-Region", region);

            request.Content = JsonContent.Create(new[] { new { Text = tekst } });

            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<TranslateResponse[]>();
            return result?.FirstOrDefault()?.Translations?.FirstOrDefault()?.Text;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Translation to Norwegian failed.");
            return null;
        }
    }

    private sealed class TranslateResponse
    {
        [JsonPropertyName("translations")]
        public Translation[]? Translations { get; set; }
    }

    private sealed class Translation
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;
    }
}
