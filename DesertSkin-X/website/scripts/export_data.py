"""Export the validated, approved demo snapshot for the browser-only edition."""

import json
import sys
from dataclasses import asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from workbook import load_dataset  # noqa: E402


def main() -> None:
    dataset = load_dataset(ROOT / "data/DesertSkin_X_Platform_Demo_Workbook.xlsx")
    payload = asdict(dataset)
    payload["provenance"] = "Demo / synthetic — modeled values, not field validation"
    text = json.dumps(payload, default=lambda value: value.isoformat(), ensure_ascii=False,
                      allow_nan=False, separators=(",", ":"))
    # A script asset keeps this version usable offline, including from file://.
    (ROOT / "website/dist/data.js").write_text(
        "window.DESERTSKIN_DATA=" + text + ";\n", encoding="utf-8"
    )
    print(f"Exported {len(dataset.readings)} readings and {len(dataset.materials)} material rows.")


if __name__ == "__main__":
    main()
