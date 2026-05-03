import json
import os
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

DATA_DIR = Path(__file__).parent.parent / "data"
OUT = Path(__file__).parent / "example-sheets" / "werk-review.xlsx"

wb = Workbook()

header_font = Font(bold=True, size=11)
header_fill = PatternFill(start_color="D9E2F3", end_color="D9E2F3", fill_type="solid")


def style_header(ws):
    for cell in ws[1]:
        cell.font = header_font
        cell.fill = header_fill
    ws.auto_filter.ref = ws.dimensions
    ws.freeze_panes = "A2"


def sources_to_str(sources):
    if not sources:
        return ""
    return "|".join(f'{s["label"]} <{s["url"]}>' for s in sources)


# --- Autoren ---
ws = wb.active
ws.title = "Autoren"
headers = ["id", "name", "slug", "aliases", "born", "died", "gnd_id", "bio", "photo_r2_key", "sources"]
ws.append(headers)

for f in sorted(DATA_DIR.glob("authors/*.json")):
    a = json.loads(f.read_text())
    ws.append([
        a["id"], a["name"], a["slug"],
        "|".join(a.get("aliases", [])),
        a.get("born"), a.get("died"), a.get("gnd_id"),
        a.get("bio", ""), a.get("photo_r2_key"),
        sources_to_str(a.get("sources", []))
    ])

style_header(ws)
ws.column_dimensions["B"].width = 25
ws.column_dimensions["H"].width = 60
ws.column_dimensions["J"].width = 40

# --- Werke ---
ws = wb.create_sheet("Werke")
headers = ["id", "author_id", "genre_id", "title", "slug", "aliases", "year_from", "year_to",
           "year_display", "collection_title", "collection_aliases", "gnd_id", "plot", "sources"]
ws.append(headers)

works = []
for f in sorted(DATA_DIR.glob("works/*.json")):
    works.append(json.loads(f.read_text()))
works.sort(key=lambda w: w.get("year_from") or 9999)

for w in works:
    ws.append([
        w["id"], w["author_id"], w["genre_id"], w["title"], w["slug"],
        "|".join(w.get("aliases", [])),
        w.get("year_from"), w.get("year_to"), w.get("year_display", ""),
        w.get("collection_title"), "|".join(w.get("collection_aliases", [])),
        w.get("gnd_id"), w.get("plot"),
        sources_to_str(w.get("sources", []))
    ])

style_header(ws)
ws.column_dimensions["D"].width = 40
ws.column_dimensions["J"].width = 30

# --- Genres ---
ws = wb.create_sheet("Genres")
headers = ["id", "name", "slug"]
ws.append(headers)

genres = json.loads((DATA_DIR / "genres.json").read_text())
for g in genres:
    ws.append([g["id"], g["name"], g["slug"]])

style_header(ws)
ws.column_dimensions["B"].width = 20

# --- Links ---
ws = wb.create_sheet("Links")
headers = ["work_id", "source", "format", "url", "label"]
ws.append(headers)

example_links = [
    ["der-gruene-heinrich-erste-fassung", "Project Gutenberg", "HTML", "https://www.gutenberg.org/ebooks/12285", "Der grüne Heinrich (Gutenberg)"],
    ["kleider-machen-leute", "Zeno.org", "HTML", "http://www.zeno.org/Literatur/M/Keller,+Gottfried/Erzählung/Kleider+machen+Leute", "Kleider machen Leute (Zeno)"],
    ["romeo-und-julia-auf-dem-dorfe", "Project Gutenberg", "HTML", "https://www.gutenberg.org/ebooks/24042", "Romeo und Julia auf dem Dorfe (Gutenberg)"],
]
for row in example_links:
    ws.append(row)

style_header(ws)
ws.column_dimensions["A"].width = 35
ws.column_dimensions["D"].width = 60
ws.column_dimensions["E"].width = 40

OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)
print(f"Created {OUT}")
print(f"  Autoren: {wb['Autoren'].max_row - 1} rows")
print(f"  Werke: {wb['Werke'].max_row - 1} rows")
print(f"  Genres: {wb['Genres'].max_row - 1} rows")
print(f"  Links: {wb['Links'].max_row - 1} rows")
