# CareCard

Digitalt matkort for sykehjem. CareCard erstatter fysiske matkort med en flerspråklig webapp der ansatte kan lese og foreslå endringer i pasienters matprofiler, mens sykepleiere og ledere godkjenner endringer før de lagres.

---

## Funksjoner

- **Pasientkort** — matprofil med allergier, konsistens, preferanser og måltidsrutiner
- **Endringsforslag** — ansatte foreslår endringer uten å skrive direkte i profilen
- **Godkjenning** — sykepleier/leder godkjenner eller avviser forslag med begrunnelse
- **Flerspråklig UI** — norsk, engelsk, spansk, polsk og portugisisk
- **Azure Translator** — automatisk oversettelse av fritekst til norsk ved innsending, med visning av original og oversatt tekst ved godkjenning
- **JWT-autentisering** — rollebasert tilgang (ansatt, sykepleier, leder)
- **Varsler** — notifikasjonsklokke for ventende godkjenninger

---

## Tech stack

| Lag | Teknologi |
|-----|-----------|
| Frontend | React 19, React Router, Tabler Icons |
| Backend | ASP.NET Core Web API (.NET 10) |
| Database | SQL Server, Entity Framework Core |
| Auth | JWT, BCrypt |
| Oversettelse | Azure Translator Text API v3 |
| Sky | Azure SQL, Azure App Service, Azure Static Web Apps |

---

## Arkitektur

```
React (Static Web App)
        │
        ▼  HTTPS + JWT
ASP.NET Core API (App Service)
        │
        ├──► Azure SQL Database
        └──► Azure Translator (ved endringsforslag / pasientkort)
```

---

## Kom i gang (lokal utvikling)

### Forutsetninger

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js 20 LTS](https://nodejs.org/)
- SQL Server (lokal eller Azure SQL)
- Azure Translator-ressurs (for oversettelse)

### 1. Database

```powershell
cd backend/CareCard.API
dotnet ef database update
```

Ved Azure SQL: sett connection string i User Secrets (se under).

### 2. Backend

```powershell
cd backend/CareCard.API
dotnet run --launch-profile http
```

API kjører på **http://localhost:5014**. API-dokumentasjon: http://localhost:5014/scalar

### 3. Frontend

```powershell
cd frontend/carecard-web
npm install
npm start
```

Appen åpnes på **http://localhost:3000**.

### Hurtigstart (Windows)

```powershell
.\scripts\start-carecard.bat
```

Stopper eventuelt gammelt API og starter backend + frontend i egne vinduer.

---

## Konfigurasjon

Hemmeligheter lagres **ikke** i `appsettings.json`. Bruk **User Secrets** lokalt og **Application settings** i Azure.

### User Secrets (lokal utvikling)

```powershell
cd backend/CareCard.API

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<din-connection-string>"
dotnet user-secrets set "Translator:Key" "<azure-translator-key>"
dotnet user-secrets set "Translator:Endpoint" "https://api.cognitive.microsofttranslator.com/"
dotnet user-secrets set "Translator:Region" "swedencentral"
```

### Azure App Service (produksjon)

| Setting | Beskrivelse |
|---------|-------------|
| `ConnectionStrings__DefaultConnection` | Azure SQL connection string |
| `Translator__Key` | Azure Translator Key 1 (full nøkkel) |
| `Translator__Endpoint` | `https://api.cognitive.microsofttranslator.com/` |
| `Translator__Region` | F.eks. `swedencentral` (små bokstaver) |
| `Jwt__Key` | Hemmelig nøkkel, minst 32 tegn |

Etter endring: **Save** → **Restart** App Service.

### Frontend (produksjon)

`REACT_APP_API_URL` settes i GitHub Actions-workflow for Azure Static Web Apps.

---

## Testbrukere

Seed-data opprettes automatisk ved oppstart hvis databasen er tom.

| Rolle | E-post | Passord |
|-------|--------|---------|
| Ansatt | `ansatt@carecard.no` | `CareCard123` |
| Sykepleier | `sykepleier@carecard.no` | `CareCard123` |
| Leder | `leder@carecard.no` | `CareCard123` |

Velg **Langtidsavdeling** for testpasienter med matprofiler.

---

## API (utvalg)

| Metode | Endepunkt | Beskrivelse |
|--------|-----------|-------------|
| POST | `/api/auth/login` | Innlogging, returnerer JWT |
| GET | `/api/pasient/avdeling/{id}` | Pasienter per avdeling |
| GET | `/api/matprofil/pasient/{id}` | Matprofil |
| POST | `/api/endringsforslag` | Opprett endringsforslag (med auto-oversettelse) |
| GET | `/api/endringsforslag/venter` | Ventende forslag |
| PUT | `/api/endringsforslag/{id}/godkjenn` | Godkjenn forslag |
| POST | `/api/oversett` | Oversett profiltekst fra norsk til UI-språk |
| GET | `/api/oversett/status` | Sjekk Translator-konfigurasjon |

Alle endepunkter unntatt `/api/auth/login` krever `Authorization: Bearer <token>`.

---

## Oversettelse

### Endringsforslag (ansatt → sykepleier)

1. Ansatt skriver fritekst på f.eks. spansk eller portugisisk
2. API auto-detekterer språk og oversetter til norsk
3. Original lagres i `NyVerdi`, norsk oversettelse i `NyVerdiOversatt`
4. Sykepleier ser begge ved godkjenning
5. Ved godkjenning lagres **norsk tekst** i pasientprofilen

### Pasientkort (lesing)

Når UI-språk ikke er norsk, oversettes profilfelter fra norsk til valgt språk via `/api/oversett`.

### Feilsøking

```http
GET /api/oversett/status
```

Returnerer om Translator er konfigurert og fungerer. Sjekk at `fungerer: true` i produksjon.

---

## Deploy

| Komponent | Metode |
|-----------|--------|
| **Frontend** | GitHub Actions → Azure Static Web Apps (automatisk ved push til `main`) |
| **Backend** | Publish fra Visual Studio / VS Code til Azure App Service |
| **Database** | `dotnet ef database update` mot Azure SQL |

---

## Prosjektstruktur

```
CareCard/
├── backend/CareCard.API/     # ASP.NET Core API
│   ├── Controllers/
│   ├── Models/
│   ├── Services/             # TranslatorService m.m.
│   ├── Data/                 # DbContext, SeedData, migrasjoner
│   └── Migrations/
├── frontend/carecard-web/    # React-app
│   └── src/
│       ├── pages/            # Login, Pasientkort, Godkjenning, …
│       ├── services/         # API-klienter
│       └── languages.js      # Flerspråklige tekster
├── scripts/                  # start-carecard.bat / .ps1
└── .github/workflows/        # CI/CD for Static Web App
```

---

## Lisens

Privat prosjekt — kontakt repository-eier for bruk utenfor teamet.
