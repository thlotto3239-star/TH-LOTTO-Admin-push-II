"""วิเคราะห์ผล audit: ข้อความละตินทุกหน้า + จุด overflow"""
import json
import glob
import os

DIR = "/home/z/my-project/scripts/audit"

def load(path):
    raw = open(path, encoding="utf-8").read().strip()
    if not raw:
        return None
    data = json.loads(raw)
    if isinstance(data, str):  # double-encoded
        data = json.loads(data)
    return data

print("########## LATIN TEXT PER PAGE ##########")
all_latin = {}
for f in sorted(glob.glob(os.path.join(DIR, "*.latin.json"))):
    pid = os.path.basename(f).split(".")[0]
    try:
        entries = load(f) or []
    except Exception as e:
        print(f"--- {pid}: PARSE ERROR {e}")
        continue
    print(f"\n--- หน้า {pid} ({len(entries)} รายการ) ---")
    for text, cnt in entries:
        print(f"   x{cnt} {text[:120]}")
        all_latin.setdefault(text, pid)

print("\n\n########## OVERFLOW PER PAGE ##########")
for f in sorted(glob.glob(os.path.join(DIR, "*.overflow.json"))):
    pid = os.path.basename(f).split(".")[0]
    try:
        issues = load(f) or []
    except Exception as e:
        print(f"--- {pid}: PARSE ERROR {e}")
        continue
    if not issues:
        continue
    print(f"\n--- หน้า {pid} ({len(issues)} จุด) ---")
    seen = set()
    for it in issues:
        key = (it["k"], it.get("text", "")[:40])
        if key in seen:
            continue
        seen.add(key)
        print(f"   [{it['k']}] <{it['tag']}> {it.get('cls','')[:60]} | {it.get('text','')[:45]} | sw-sh:{it.get('sw', it.get('sh'))} cw-ch:{it.get('cw', it.get('ch'))}")
