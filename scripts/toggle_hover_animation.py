import re
import sys
from pathlib import Path

# When in vintage-blue-main/scripts/, base dir is vintage-blue-main/
BASE_DIR = Path(__file__).resolve().parent.parent
APP_JS = BASE_DIR / "app.js"
STYLES_CSS = BASE_DIR / "styles.css"
HOME2_CSS = BASE_DIR / "home2.css"
INDEX_HTML = BASE_DIR / "index.html"

PAUSED_STYLES_BLOCK = """/* ==========================================================================
   PRODUCT HOVER ANIMATION: PAUSED
   Toggle via ENABLE_PRODUCT_HOVER_ANIMATION in app.js.
   ========================================================================== */
.card:hover .card-media img.alt,
.uy-cell:hover .uy-media img.alt {
  opacity: 0 !important;
}
.uy-cell:hover .uy-media img:not(.alt) {
  opacity: 1 !important;
}
"""

PAUSED_HOME2_BLOCK = """/* ==========================================================================
   PRODUCT HOVER ANIMATION: PAUSED
   ========================================================================== */
.g-tile:hover .g-alt {
  opacity: 0 !important;
}
"""

def bump_version(text, file_pattern):
    def repl(m):
        prefix = m.group(1)
        ver = int(m.group(2))
        suffix = m.group(3)
        return f"{prefix}{ver + 1}{suffix}"
    return re.sub(file_pattern, repl, text)

def set_hover_state(action="pause"):
    is_paused = (action == "pause")
    flag_val = "false" if is_paused else "true"
    
    # 1. Update app.js
    app_text = APP_JS.read_text(encoding="utf-8")
    app_text = re.sub(
        r"const ENABLE_PRODUCT_HOVER_ANIMATION = (true|false);",
        f"const ENABLE_PRODUCT_HOVER_ANIMATION = {flag_val};",
        app_text
    )
    app_text = re.sub(
        r"window\.ENABLE_PRODUCT_HOVER_ANIMATION = (true|false);",
        f"window.ENABLE_PRODUCT_HOVER_ANIMATION = {flag_val};",
        app_text
    )
    APP_JS.write_text(app_text, encoding="utf-8")
    print(f"[app.js] Set ENABLE_PRODUCT_HOVER_ANIMATION = {flag_val}")

    # 2. Update styles.css
    styles_text = STYLES_CSS.read_text(encoding="utf-8")
    if is_paused:
        if "PRODUCT HOVER ANIMATION: PAUSED" not in styles_text:
            styles_text = styles_text.rstrip() + "\n\n" + PAUSED_STYLES_BLOCK
            print("[styles.css] Added paused CSS block")
    else:
        if "PRODUCT HOVER ANIMATION: PAUSED" in styles_text:
            styles_text = styles_text.replace(PAUSED_STYLES_BLOCK, "").rstrip() + "\n"
            print("[styles.css] Removed paused CSS block (hover animations restored)")
    STYLES_CSS.write_text(styles_text, encoding="utf-8")

    # 3. Update home2.css
    home2_text = HOME2_CSS.read_text(encoding="utf-8")
    if is_paused:
        if "PRODUCT HOVER ANIMATION: PAUSED" not in home2_text:
            home2_text = home2_text.rstrip() + "\n\n" + PAUSED_HOME2_BLOCK
            print("[home2.css] Added paused CSS block")
    else:
        if "PRODUCT HOVER ANIMATION: PAUSED" in home2_text:
            home2_text = home2_text.replace(PAUSED_HOME2_BLOCK, "").rstrip() + "\n"
            print("[home2.css] Removed paused CSS block (hover animations restored)")
    HOME2_CSS.write_text(home2_text, encoding="utf-8")

    # 4. Bump index.html cache busters
    index_text = INDEX_HTML.read_text(encoding="utf-8")
    index_text = bump_version(index_text, r'(/styles\.css\?v=)(\d+)(")')
    index_text = bump_version(index_text, r'(/home2\.css\?v=)(\d+)(")')
    index_text = bump_version(index_text, r'(/app\.js\?v=)(\d+)(")')
    INDEX_HTML.write_text(index_text, encoding="utf-8")
    print("[index.html] Cache-busters bumped")

if __name__ == "__main__":
    action = sys.argv[1].lower() if len(sys.argv) > 1 else "pause"
    if action not in ["pause", "resume"]:
        print("Usage: python toggle_hover_animation.py [pause|resume]")
        sys.exit(1)
    set_hover_state(action)
    print(f"Hover animation successfully set to: {action.upper()}")
