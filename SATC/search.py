"""
Word/theme search over Sex and the City dialogue CSV.
"""
import os
import pandas as pd


def get_csv_path():
    return os.path.join(os.path.dirname(__file__), "..", "SATC files", "SATC_all_lines.csv")


def load_dialogues():
    path = get_csv_path()
    if not os.path.isfile(path):
        raise FileNotFoundError(f"CSV not found: {path}")
    df = pd.read_csv(path)
    # Normalize column names (in case of leading comma in header)
    df = df.rename(columns={c: c.strip() for c in df.columns})
    if "Line" not in df.columns:
        raise ValueError("CSV must have 'Line' column")
    return df


def search(df, query, limit=500):
    """
    Search for a word or phrase in the dialogue lines.
    Case-insensitive; matches substrings (word or theme).
    Returns list of dicts: season, episode, speaker, line.
    """
    if not query or not str(query).strip():
        return []
    q = str(query).strip().lower()
    # Match rows where Line contains the query
    mask = df["Line"].astype(str).str.lower().str.contains(q, na=False, regex=False)
    out = df.loc[mask].head(limit)
    return [
        {
            "season": int(float(row["Season"])) if pd.notna(row.get("Season")) else None,
            "episode": int(float(row["Episode"])) if pd.notna(row.get("Episode")) else None,
            "speaker": str(row["Speaker"]).strip() if pd.notna(row.get("Speaker")) else "",
            "line": str(row["Line"]).strip() if pd.notna(row["Line"]) else "",
        }
        for _, row in out.iterrows()
    ]
