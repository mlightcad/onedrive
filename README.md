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

The viewer is published at `https://mlightcad.com/onedrive/`. OneDrive File Handler preview is a POST with the Graph file link, which GitHub Pages cannot accept (CDN `405`). Production preview must use the Cloudflare Worker in [`cloudflare/file-handler-worker.js`](./cloudflare/file-handler-worker.js) as the File Handler URL; it hands the payload to the static app via the URL hash. Personal OneDrive does not support File Handlers. See [ONEDRIVE_APP_SETUP.md](./ONEDRIVE_APP_SETUP.md).

## Local File Handler testing

The easy path only asks you to sign in:

```bash
pnpm demo:file-handler
```

That starts `pnpm dev` if needed, then opens `http://localhost:5173/onedrive/?fileHandlerDemo=1`. After Microsoft sign-in (skipped if a session already exists), the app searches OneDrive for a `.dwg` / `.dxf`, POSTs it to `/onedrive/preview` the same way OneDrive would, and opens the drawing. If no CAD file is found, use the picker once. Keep a DWG or DXF in that OneDrive account. Press Ctrl+C in the terminal if this command started the dev server.

The demo query string only works on `localhost`. It is not available on GitHub Pages.

### Check the POST handoff with known ids

You can also drive the local POST yourself. Keep `pnpm dev` on port **5173**, then:

```bash
pnpm verify:file-handler -- --drive-id YOUR_DRIVE_ID --item-id YOUR_ITEM_ID --open
```

Or with a full Graph URL:

```bash
pnpm verify:file-handler -- --item-url "https://graph.microsoft.com/v1.0/drives/YOUR_DRIVE_ID/items/YOUR_ITEM_ID" --open
```

The script checks that the local viewer is up, POSTs `/onedrive/preview`, and validates the handoff HTML. `--open` opens the production-style hash URL in the browser. Optionally add `--worker https://mlightcad-onedrive-file-handler.mlightcad.workers.dev/` to POST the same body to the deployed Worker.

| Result | Meaning |
|--------|---------|
| Preview sign-in screen appears | Activation handoff worked |
| Drawing opens after sign-in | Full local File Handler path worked |
| Normal “choose a file” welcome screen | Activation was not read (wrong port/path, or POST failed) |
| Sign-in works but file fails to open | Bad Graph item URL, or the signed-in account cannot read that item |

## Project Structure

```
src/
├── main.ts           # UI wiring and app flow
├── oneDrive.ts       # MSAL, Graph download, OneDrive Picker v8
├── fileHandler.ts    # File Handler activation handoff
├── cadEmbed.ts       # MLightCAD iframe + postMessage
├── mlightcadEmbed.ts # Embed URL helpers
├── siteChrome.ts     # Loads shared header/footer from mlightcad.com
├── i18n.ts           # App locale + copy
├── privacyPage.ts    # Privacy policy page
└── styles.css        # App styles
server/
├── fileHandler.mjs   # Local POST /onedrive/preview
└── start.mjs         # Production static host + File Handler POST
cloudflare/
├── file-handler-worker.js  # POST hop for GitHub Pages
└── wrangler.toml
scripts/
├── demo-file-handler.mjs   # Start dev server and open the sign-in demo
└── verify-file-handler.mjs # Local File Handler handoff check
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

Header and footer are loaded from the marketing site (`/site-chrome.js`), not copied in this repo. Production uses `https://mlightcad.com/site-chrome.js`. For a local chrome, run the mlightcad.com homepage on another port and set `VITE_SITE_CHROME_ORIGIN` (for example `http://localhost:5174`). The privacy page follows the same `mlightcad-locale` setting as the rest of mlightcad.com (English, Chinese, Japanese, Korean, Spanish, Portuguese, Russian, Czech).

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
