# SATC Word Search

Search for a word or theme in Sex and the City dialogue.

## Open the website (no server)

1. **Build once** (from the `SATC` folder):
   ```bash
   pip install -r requirements.txt
   python build_site.py
   ```
   The CSV must be at `../SATC files/SATC_all_lines.csv`.

2. **Open the file in your browser:**
   - Double-click **`index.html`** in the `SATC` folder, or  
   - In your browser: **File → Open File** and choose `SATC/index.html`

No server or link needed — the page runs entirely in the browser. Type a word (e.g. *Manolo*, *love*, *brunch*) and click Search or press Enter.

---

## Deploy to Vercel

From the **repo root** (parent of `SATC`):

1. Install [Vercel CLI](https://vercel.com/cli) and run `vercel`
2. Or connect the repo at [vercel.com](https://vercel.com) — the root `vercel.json` configures the build

The build uses `build_site.py` to create a static site with all dialogue embedded. No server needed.

---

## Optional: run with Flask server

```bash
python app.py
```

Then open **http://127.0.0.1:5000**. Same search; results come from the server.

- API: `GET /api/search?q=word&limit=300`
