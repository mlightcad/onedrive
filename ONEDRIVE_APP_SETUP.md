# OneDrive / Azure App Setup

Step-by-step setup for running **OneDrive CAD Viewer** against Microsoft identity and the OneDrive File Picker v8.

## 1. Register an Entra ID application

1. Open [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. **New registration**
3. Name: e.g. `OneDrive CAD Viewer`
4. Supported account types (recommended for public demo):
   - **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts**
5. Redirect URI:
   - Platform: **Single-page application (SPA)**
   - URI: `http://localhost:5173/onedrive/`
   - Also add `https://mlightcad.com/onedrive/` for GitHub Pages

Copy **Application (client) ID** → `VITE_MSAL_CLIENT_ID`.

## 2. Authentication settings

Under **Authentication**:

- Confirm SPA redirect URIs:
  - `http://localhost:5173/onedrive/`
  - `https://mlightcad.com/onedrive/`
- Enable **ID tokens** (implicit grant) if your tenant still lists the checkbox; MSAL popup primarily uses auth code + PKCE

`VITE_MSAL_REDIRECT_URI` must match one of these URIs exactly, including the `/onedrive/` path.

## 3. API permissions

**Microsoft Graph** (delegated):

| Permission | Purpose |
|------------|---------|
| `User.Read` | Profile name / photo |
| `Files.Read` | Download the user’s files; maps to picker scope `OneDrive.ReadOnly` for personal accounts |
| `Files.Read.All` | Broader OneDrive/SharePoint read (often needed for picker scenarios) |
| `Sites.Read.All` | SharePoint site read for work-account picker |

**SharePoint** (delegated, recommended for work accounts):

| Permission | Purpose |
|------------|---------|
| `MyFiles.Read` | OneDrive for Business files via SharePoint resource tokens |

Grant **admin consent** if your organization requires it.

## 4. Tenant choice (`VITE_MSAL_TENANT_ID`)

| Value | Meaning |
|-------|---------|
| `common` | Work + personal (default) |
| `organizations` | Work / school only |
| `consumers` | Personal Microsoft accounts only |
| `{tenant-guid}` | Single tenant |

Personal accounts use the consumer picker host (`https://onedrive.live.com/picker`). Work accounts use `{onedrive-host}/_layouts/15/FilePicker.aspx`, where the host is derived from Graph `GET /me/drive` → `webUrl`.

## 5. Local env

```bash
cp env.example .env.local
```

```env
VITE_MSAL_CLIENT_ID=<application-client-id>
VITE_MSAL_TENANT_ID=common
VITE_MSAL_REDIRECT_URI=http://localhost:5173/onedrive/
```

```bash
pnpm install
pnpm dev
```

## 6. GitHub Pages

Publish [mlightcad/onedrive](https://github.com/mlightcad/onedrive) with the included GitHub Actions workflow. In the repository, set **Settings → Pages → Source** to **GitHub Actions**.

Do not configure a custom domain on this repository. `mlightcad.com` is already the domain of the organization site, so this project is served at `https://mlightcad.com/onedrive/`.

Repository → **Settings → Secrets and variables → Actions**:

| Secret | Maps to |
|--------|---------|
| `MSAL_CLIENT_ID` | `VITE_MSAL_CLIENT_ID` |
| `MSAL_REDIRECT_URI` | Optional. Defaults to `https://mlightcad.com/onedrive/` |
| `MSAL_TENANT_ID` | Optional. Defaults to `common` |

The production redirect URI must also be on the Azure SPA registration.

## 7. Privacy / publisher checklist

- Host `privacy.html` on the same origin as the app
- Link it from the consent / product page
- Describe Graph scopes and that CAD bytes stay in the browser

## 8. File Handler preview (OneDrive for Business / SharePoint)

Clicking a `.dwg` or `.dxf` in OneDrive for Business or SharePoint loads this app inside Microsoft’s preview iframe. Personal OneDrive (`onedrive.live.com`) does not support File Handlers.

The Entra application already has this File Handler. Do not add a second one:

| Field | Value |
|-------|--------|
| Add-in id | `c4578f29-473a-47fa-b2d2-a92556b9748f` |
| Preview URL | `https://mlightcad.com/onedrive/preview` |
| Extensions | `.dwg`, `.dxf` |

A copy of that add-in is in [`file-handler.manifest.json`](./file-handler.manifest.json). The Pages build publishes the same viewer at `https://mlightcad.com/onedrive/preview/` (`preview/index.html`).

OneDrive does not open that address with a GET. It POSTs a form body containing the Graph file link. `mlightcad.com` is GitHub Pages, and a POST to that host is rejected with `405 Method Not Allowed` by the CDN before this app runs. Publishing the repository makes the page exist, but it does not make click-to-preview receive the file.

`pnpm dev` still accepts that POST at `http://localhost:5173/onedrive/preview` so the handoff can be tested locally. The body is written into `sessionStorage` and the app opens at `/onedrive/`. `items` is a JSON array of Graph item URLs. Fields are `items`, `userId`, `cultureName`, `client`, and `domainHint`.

## References

- [OneDrive File Handlers](https://learn.microsoft.com/en-us/onedrive/developer/file-handlers/)
- [OneDrive File Picker v8](https://learn.microsoft.com/en-us/onedrive/developer/controls/file-pickers/)
- [MSAL.js browser](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser)
- [Microsoft Graph driveItem content](https://learn.microsoft.com/en-us/graph/api/driveitem-get-content)
