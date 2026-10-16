import sys
import re

path = r"C:\Users\PUSBIKES-KEMKES\Downloads\Ferrari COP TAH by RushArt V6.1 GROUP.ex5"

with open(path, "rb") as f:
    data = f.read()

# 1. ASCII strings
ascii_matches = re.findall(b"[\x20-\x7e]{3,}", data)
ascii_list = [m.decode("latin1") for m in ascii_matches]

# 2. UTF-16LE strings (MQL5 default for strings and wide chars)
utf16_matches = re.findall(b"(?:[\x20-\x7e]\x00){3,}", data)
utf16_list = [m.decode("utf-16le") for m in utf16_matches]

all_strings = set(ascii_list + utf16_list)

print(f"Total binary size: {len(data)} bytes")
print(f"Total unique strings extracted: {len(all_strings)}")

keywords = [
    "cop", "tah", "rushart", "ferrari", "jika", "busur", "perahu", "hsh", "matrix",
    "pivot", "target", "lot", "modal", "asia", "eropa", "usa", "normal", "strong",
    "input", "level", "open", "high", "low", "close", "candle", "rule", "hour",
    "week", "month", "quarter", "year", "semester", "r1", "r2", "s1", "s2", "spread",
    "tp", "sl", "entry", "order", "magic", "risk", "balance", "equity"
]

print("\n=== MATCHED STRINGS IN FERRARI COP TAH V6.1 ===")
matched = []
for s in sorted(all_strings):
    s_clean = s.strip()
    if 3 <= len(s_clean) <= 120 and any(k in s_clean.lower() for k in keywords):
        matched.append(s_clean)

for m in matched:
    print(m)

# Also look for parameter definitions or specific text blocks
print("\n=== ALL STRINGS LONGER THAN 8 CHARACTERS WITH LETTERS ===")
meaningful = []
for s in sorted(all_strings):
    s_clean = s.strip()
    if len(s_clean) >= 8 and any(c.isalpha() for c in s_clean) and len(s_clean) <= 150:
        meaningful.append(s_clean)

with open(r"c:\TRADING\extracted_ea_strings.txt", "w", encoding="utf-8") as out:
    for item in meaningful:
        out.write(item + "\n")

print(f"Saved {len(meaningful)} meaningful strings to c:\\TRADING\\extracted_ea_strings.txt")
