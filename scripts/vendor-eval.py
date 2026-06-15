# Vendors the HR-onboarding-rag eval results JSON into src/data/, repairing
# cp1252 double-encoding mojibake (e.g. Â£ -> pound sign, Ã— -> times sign).
# The repair is byte-deterministic and touches encoding only: numbers, scores,
# structure, and wording are preserved exactly. Re-runnable.
import json, sys, io

SRC = sys.argv[1]
DST = sys.argv[2]

with io.open(SRC, encoding="utf-8") as f:
    raw = f.read()
data = json.loads(raw)

# Telltale leading bytes of UTF-8 sequences mis-decoded as cp1252.
MARKERS = ("Â", "Ã", "â", "Å", "à")

def looks_mojibake(s):
    return any(m in s for m in MARKERS)

def fix_str(s):
    if not looks_mojibake(s):
        return s
    try:
        return s.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s

def walk(o):
    if isinstance(o, str):
        return fix_str(o)
    if isinstance(o, list):
        return [walk(x) for x in o]
    if isinstance(o, dict):
        return {k: walk(v) for k, v in o.items()}
    return o

fixed = walk(data)

# Sanity: numeric values must be byte-identical pre/post repair.
def numbers(o, path=""):
    out = {}
    if isinstance(o, dict):
        for k, v in o.items():
            out.update(numbers(v, path + "/" + str(k)))
    elif isinstance(o, list):
        for i, v in enumerate(o):
            out.update(numbers(v, path + "/" + str(i)))
    elif isinstance(o, (int, float)) and not isinstance(o, bool):
        out[path] = o
    return out

assert numbers(data) == numbers(fixed), "numeric values changed during repair"

# Sanity: no mojibake markers should remain anywhere.
def any_marker(o):
    if isinstance(o, str):
        return looks_mojibake(o)
    if isinstance(o, list):
        return any(any_marker(x) for x in o)
    if isinstance(o, dict):
        return any(any_marker(v) for v in o.values())
    return False

remaining = any_marker(fixed)

with io.open(DST, "w", encoding="utf-8", newline="\n") as f:
    json.dump(fixed, f, ensure_ascii=False, indent=2)
    f.write("\n")

print("results:", len(fixed["results"]))
print("summary:", fixed["summary"])
print("mojibake markers remaining:", remaining)
print("wrote:", DST)
