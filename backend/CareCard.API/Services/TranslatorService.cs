using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CareCard.API.Services;

public class TranslatorService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

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

    public bool ErKonfigurert =>
        !string.IsNullOrWhiteSpace(_configuration["Translator:Key"]);

    public async Task<string?> TranslaterTilNorsk(string tekst, string? kildeSprak = null)
    {
        if (string.IsNullOrWhiteSpace(tekst))
            return null;

        if (string.IsNullOrWhiteSpace(_configuration["Translator:Key"]))
        {
            _logger.LogWarning("Translator:Key is not configured — skipping translation.");
            return null;
        }

        try
        {
            // Auto-detect først — UI-språk styrer ikke om vi oversetter
            var responses = await SendTranslateRequest(
                new[] { tekst },
                toLang: "nb",
                fromLang: null,
                fallbackToOriginal: false);

            var entry = responses.FirstOrDefault();
            var oversatt = entry?.TranslatedText;

            // Kort/tvetydig tekst: prøv igjen med hint fra UI-språk (f.eks. es → solo leche)
            if (string.IsNullOrWhiteSpace(oversatt)
                && !string.IsNullOrWhiteSpace(kildeSprak)
                && kildeSprak is not ("no" or "nb"))
            {
                var hintFrom = MapKildeSprakTilAzure(kildeSprak);
                responses = await SendTranslateRequest(
                    new[] { tekst },
                    toLang: "nb",
                    fromLang: hintFrom,
                    fallbackToOriginal: false);
                entry = responses.FirstOrDefault();
                oversatt = entry?.TranslatedText;
            }

            if (string.IsNullOrWhiteSpace(oversatt))
            {
                _logger.LogWarning("Translation returned empty for text length {Length}.", tekst.Length);
                return null;
            }

            if (ErNorsk(entry?.DetectedLanguage) && entry?.DetectedScore >= 0.5)
            {
                _logger.LogDebug("Text detected as Norwegian — skipping NyVerdiOversatt.");
                return null;
            }

            if (string.Equals(oversatt.Trim(), tekst.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogDebug("Translation identical to original — skipping NyVerdiOversatt.");
                return null;
            }

            return oversatt;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Translation to Norwegian failed.");
            return null;
        }
    }

    public async Task<IReadOnlyList<string>> OversettFraNorsk(
        IReadOnlyList<string> tekster,
        string malSprak)
    {
        if (malSprak is "no" or "nb" || tekster.Count == 0)
            return tekster;

        var azureMal = MapTilAzureSprak(malSprak);
        var responses = await SendTranslateRequest(
            tekster,
            azureMal,
            fromLang: "nb",
            fallbackToOriginal: true);

        return responses.Select(r => r.TranslatedText ?? string.Empty).ToList();
    }

    private async Task<IReadOnlyList<TranslateResult>> SendTranslateRequest(
        IReadOnlyList<string> tekster,
        string toLang,
        string? fromLang,
        bool fallbackToOriginal)
    {
        var results = new TranslateResult[tekster.Count];
        var toTranslate = new List<(int Index, string Text)>();

        for (var i = 0; i < tekster.Count; i++)
        {
            if (string.IsNullOrWhiteSpace(tekster[i]))
                results[i] = new TranslateResult { TranslatedText = tekster[i] };
            else
                toTranslate.Add((i, tekster[i]));
        }

        if (toTranslate.Count == 0)
            return results;

        var key = _configuration["Translator:Key"];
        var endpoint = _configuration["Translator:Endpoint"]
            ?? "https://api.cognitive.microsofttranslator.com/";
        var region = _configuration["Translator:Region"];

        if (string.IsNullOrWhiteSpace(key))
        {
            _logger.LogWarning("Translator:Key is not configured — skipping translation.");
            if (fallbackToOriginal)
            {
                for (var i = 0; i < tekster.Count; i++)
                    results[i] = new TranslateResult { TranslatedText = tekster[i] };
            }
            return results;
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            var baseUrl = endpoint.TrimEnd('/');
            var fromQuery = string.IsNullOrWhiteSpace(fromLang) ? string.Empty : $"&from={fromLang}";
            var requestUri = $"{baseUrl}/translate?api-version=3.0&to={toLang}{fromQuery}";

            using var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            request.Headers.Add("Ocp-Apim-Subscription-Key", key);
            if (!string.IsNullOrWhiteSpace(region))
                request.Headers.Add("Ocp-Apim-Subscription-Region", region);

            request.Content = JsonContent.Create(
                toTranslate.Select(x => new { Text = x.Text }).ToArray());

            var response = await client.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "Translator API returned {StatusCode}: {Body}",
                    (int)response.StatusCode,
                    responseBody);
                response.EnsureSuccessStatusCode();
            }

            var translated = JsonSerializer.Deserialize<TranslateResponse[]>(responseBody, JsonOptions);

            for (var j = 0; j < toTranslate.Count; j++)
            {
                var (index, original) = toTranslate[j];
                var entry = translated?[j];
                var translatedText = entry?.Translations?.FirstOrDefault()?.Text;

                results[index] = new TranslateResult
                {
                    TranslatedText = translatedText ?? (fallbackToOriginal ? original : string.Empty),
                    DetectedLanguage = entry?.DetectedLanguage?.Language,
                    DetectedScore = entry?.DetectedLanguage?.Score,
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Translation to {ToLang} failed.", toLang);
            if (fallbackToOriginal)
            {
                for (var i = 0; i < tekster.Count; i++)
                    results[i] = new TranslateResult { TranslatedText = tekster[i] };
            }
        }

        return results;
    }

    private static bool ErNorsk(string? languageCode)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            return false;

        var code = languageCode.Split('-')[0].ToLowerInvariant();
        return code is "nb" or "no" or "nn";
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

    private static string MapKildeSprakTilAzure(string kildeSprak) =>
        MapTilAzureSprak(kildeSprak);

    private sealed class TranslateResult
    {
        public string? TranslatedText { get; set; }
        public string? DetectedLanguage { get; set; }
        public double? DetectedScore { get; set; }
    }

    private sealed class TranslateResponse
    {
        [JsonPropertyName("detectedLanguage")]
        public DetectedLanguage? DetectedLanguage { get; set; }

        [JsonPropertyName("translations")]
        public Translation[]? Translations { get; set; }
    }

    private sealed class DetectedLanguage
    {
        [JsonPropertyName("language")]
        public string Language { get; set; } = string.Empty;

        [JsonPropertyName("score")]
        public double Score { get; set; }
    }

    private sealed class Translation
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;
    }
}
