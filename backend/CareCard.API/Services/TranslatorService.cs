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

        var result = await SendTranslateRequest(
            new[] { tekst },
            toLang: "nb",
            fromLang: null);

        return result[0];
    }

    public async Task<IReadOnlyList<string>> OversettFraNorsk(
        IReadOnlyList<string> tekster,
        string malSprak)
    {
        if (malSprak is "no" or "nb" || tekster.Count == 0)
            return tekster;

        var azureMal = MapTilAzureSprak(malSprak);
        return await SendTranslateRequest(tekster, azureMal, fromLang: "nb");
    }

    private async Task<IReadOnlyList<string>> SendTranslateRequest(
        IReadOnlyList<string> tekster,
        string toLang,
        string? fromLang)
    {
        var result = new string[tekster.Count];
        var toTranslate = new List<(int Index, string Text)>();

        for (var i = 0; i < tekster.Count; i++)
        {
            if (string.IsNullOrWhiteSpace(tekster[i]))
                result[i] = tekster[i];
            else
                toTranslate.Add((i, tekster[i]));
        }

        if (toTranslate.Count == 0)
            return result;

        var key = _configuration["Translator:Key"];
        var endpoint = _configuration["Translator:Endpoint"]
            ?? "https://api.cognitive.microsofttranslator.com/";
        var region = _configuration["Translator:Region"];

        if (string.IsNullOrWhiteSpace(key))
        {
            _logger.LogWarning("Translator:Key is not configured — skipping translation.");
            for (var i = 0; i < tekster.Count; i++)
                result[i] = tekster[i];
            return result;
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            var baseUrl = endpoint.TrimEnd('/');
            var fromQuery = string.IsNullOrWhiteSpace(fromLang) ? "" : $"&from={fromLang}";
            var requestUri = $"{baseUrl}/translate?api-version=3.0&to={toLang}{fromQuery}";

            using var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            request.Headers.Add("Ocp-Apim-Subscription-Key", key);
            if (!string.IsNullOrWhiteSpace(region))
                request.Headers.Add("Ocp-Apim-Subscription-Region", region);

            request.Content = JsonContent.Create(
                toTranslate.Select(x => new { Text = x.Text }).ToArray());

            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var translated = await response.Content.ReadFromJsonAsync<TranslateResponse[]>();

            for (var j = 0; j < toTranslate.Count; j++)
            {
                var (index, original) = toTranslate[j];
                result[index] = translated?[j]?.Translations?.FirstOrDefault()?.Text ?? original;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Translation to {ToLang} failed.", toLang);
            for (var i = 0; i < tekster.Count; i++)
                result[i] = tekster[i];
        }

        return result;
    }

    private static string MapTilAzureSprak(string malSprak) =>
        malSprak.ToLowerInvariant() switch
        {
            "en" => "en",
            "es" => "es",
            "pl" => "pl",
            "pt" => "pt-br",
            _ => malSprak,
        };

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
