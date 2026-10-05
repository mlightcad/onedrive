# OneDrive CAD Viewer

A lightweight web app that opens CAD files (DWG, DXF) from OneDrive in the [MLightCAD embed viewer](https://mlightcad.com/iframe-plugin.html).

## Features

- **OneDrive File Picker**: Choose files with Microsoft’s official OneDrive / SharePoint File Picker v8 (no custom file browser)
- **Personal + work accounts**: Supports consumer OneDrive and Microsoft 365 OneDrive for Business
- **CAD Viewer**: Drawings open in MLightCAD’s embed iframe via `postMessage`
- **Small footprint**: Vanilla TypeScript + CSS + `@azure/msal-browser`

## Supported File Formats

- **DWG** — AutoCAD Drawing files
- **DXF** — Drawing Exchange Format

## Technology Stack

- **Frontend**: Vanilla TypeScript + CSS
- **CAD Viewer**: [MLightCAD iframe plugin](https://mlightcad.com/iframe-plugin.html) (`https://mlightcad.com/embed.html`)
- **Microsoft APIs**: MSAL.js, Microsoft Graph, [OneDrive File Picker v8](https://learn.microsoft.com/en-us/onedrive/developer/controls/file-pickers/)
- **Build Tool**: Vite

## Prerequisites

1. Go to the [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Register a new application (SPA)
3. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts** (or narrower if you prefer)
4. Add **Single-page application** redirect URIs:
   - `http://localhost:5173/onedrive/`
   - `https://mlightcad.com/onedrive/`
5. Under **API permissions** (delegated), add:
   - `User.Read`
   - `Files.Read`
   - For work accounts / picker: also `Files.Read.All`, `Sites.Read.All` (Graph) and optionally SharePoint `MyFiles.Read`
6. Note the **Application (client) ID** — this is `VITE_MSAL_CLIENT_ID`

See [ONEDRIVE_APP_SETUP.md](./ONEDRIVE_APP_SETUP.md) for a step-by-step walkthrough.

## Installation

```bash
git clone https://github.com/mlightcad/onedrive.git
cd onedrive
pnpm install
```

```bash
cp env.example .env.local
```

Edit `.env.local`:

```env
VITE_MSAL_CLIENT_ID=your_client_id_here
VITE_MSAL_TENANT_ID=common
VITE_MSAL_REDIRECT_URI=http://localhost:5173/onedrive/
# Optional. Defaults to https://mlightcad.com/embed.html
# VITE_MLIGHTCAD_EMBED_URL=https://mlightcad.com/embed.html
```

## Development

```bash
pnpm dev
```

App URL: `http://localhost:5173/onedrive/`

## Building for Production

```bash
pnpm build
pnpm preview
```

## Usage

1. Click **Sign in with Microsoft** and authorize
2. Click **Choose from OneDrive** to open the official file picker
3. Select a `.dwg` or `.dxf` file
4. The app downloads the file with Microsoft Graph and opens it in the MLightCAD embed iframe

Optional deep link: `?driveId=...&itemId=...` opens a known Drive item after sign-in.

### OneDrive / SharePoint click preview

This repo deploys with GitHub Actions to GitHub Pages. Because [mlightcad.com](https://mlightcad.com/) is already the organization site’s custom domain, the project is published at `https://mlightcad.com/onedrive/`. Do not add a separate custom domain or `CNAME` on [mlightcad/onedrive](https://github.com/mlightcad/onedrive).

The registered File Handler URL is `https://mlightcad.com/onedrive/preview`. The Pages build serves the viewer there (`preview/index.html`). OneDrive sends the file as a form POST, and `mlightcad.com` answers every POST with `405` before the page runs, so that click does not deliver the file. Personal OneDrive does not support File Handlers. See [ONEDRIVE_APP_SETUP.md](./ONEDRIVE_APP_SETUP.md).

## Project Structure

```
src/
├── main.ts           # UI wiring and app flow
├── oneDrive.ts       # MSAL, Graph download, OneDrive Picker v8
├── fileHandler.ts    # File Handler activation handoff
├── cadEmbed.ts       # MLightCAD iframe + postMessage
├── mlightcadEmbed.ts # Embed URL helpers
└── styles.css        # App styles
server/
├── fileHandler.mjs   # POST /onedrive/preview
└── start.mjs         # Production static host + File Handler POST
```

## API Permissions

- `User.Read` — show signed-in account
- `Files.Read` — download files the user selects
- Picker may request SharePoint resource tokens (`{host}/.default`) or `OneDrive.ReadOnly` for personal accounts

## How viewing works

This app does **not** bundle `@mlightcad/cad-viewer`. After you pick a OneDrive file it:

1. Downloads the DWG/DXF in this page via Microsoft Graph (`@microsoft.graph.downloadUrl`)
2. Opens [MLightCAD embed](https://mlightcad.com/embed.html) in an iframe (`mode=review&toolbar=1`)
3. Sends the file bytes with `postMessage` (`mlightcad-embed:open`) after the embed reports `mlightcad-embed:ready`
4. The drawing is parsed and rendered **in the visitor’s browser**

Local embed testing: set `VITE_MLIGHTCAD_EMBED_URL` to your local embed page (for example `http://localhost:5174/embed.html`).

## Security

- Authentication uses Microsoft identity (MSAL popup)
- Credentials live in environment variables
- Drawing bytes are downloaded in-page and sent to the embed iframe via `postMessage`; they are not stored by this app
- In-app Privacy links open `privacy.html`

## Troubleshooting

1. **Authentication fails**: Check SPA redirect URI matches `VITE_MSAL_REDIRECT_URI` / current origin exactly
2. **Picker does not open**: Allow popups; ensure Graph can resolve `/me/drive` for the signed-in account
3. **Picker shows “this item might not exist”**: Personal accounts need `Files.Read` (the picker uses `OneDrive.ReadOnly`, not a Graph token). Work accounts open FilePicker on the user’s `/personal/...` site, not the tenant root. Allow a second consent popup if prompted.
4. **Files not loading**: Token may have expired — sign out and sign in again
5. **Drawing does not open**: Confirm the file is `.dwg`/`.dxf`

## License

MIT
