"""Generate the website's illustrative DevOps GIF and reduced-motion poster.

Run with Python and Pillow; no network or third-party image assets are used.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "images"
WIDTH, HEIGHT, SCALE = 960, 240, 2
FRAME_COUNT = 24
BACKGROUND = "#0d141b"
SURFACE = "#15232d"
MINT = "#9ef2cb"
CYAN = "#83dcf5"
TEXT = "#edf3f2"
MUTED = "#b3c8cd"
LINE = "#3b6874"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size * SCALE)
    return ImageFont.load_default(size=size * SCALE)


def frame(index: int) -> Image.Image:
    image = Image.new("RGB", (WIDTH * SCALE, HEIGHT * SCALE), BACKGROUND)
    draw = ImageDraw.Draw(image)

    def line(points, fill=LINE, width=1):
        draw.line([(int(x * SCALE), int(y * SCALE)) for x, y in points], fill=fill, width=width * SCALE, joint="curve")

    def circle(x, y, radius, fill):
        draw.ellipse(((x - radius) * SCALE, (y - radius) * SCALE, (x + radius) * SCALE, (y + radius) * SCALE), fill=fill)

    def text(x, y, value, size, fill=TEXT, bold=False, anchor="mm"):
        draw.text((x * SCALE, y * SCALE), value, font=font(size, bold), fill=fill, anchor=anchor)

    text(36, 25, "AUTOMATED DELIVERY", 11, MUTED, True, "lm")
    text(924, 25, "CONTINUOUS FEEDBACK", 11, MUTED, True, "rm")
    stages = [(36, "Code", "Version & review"), (264, "Build", "Validate & package"), (492, "Deploy", "Release with care"), (720, "Observe", "Learn & improve")]
    for x, label, subtitle in stages:
        draw.rounded_rectangle((x * SCALE, 54 * SCALE, (x + 204) * SCALE, 164 * SCALE), radius=12 * SCALE, fill=SURFACE, outline=LINE, width=SCALE)
        text(x + 66, 102, label, 22, bold=True, anchor="lm")
        text(x + 66, 131, subtitle, 11, MUTED, anchor="lm")
        if label == "Code":
            line([(x + 33, 92), (x + 23, 104), (x + 33, 116)], MINT, 2)
            line([(x + 45, 92), (x + 55, 104), (x + 45, 116)], MINT, 2)
            line([(x + 42, 91), (x + 36, 117)], CYAN, 2)
        elif label == "Build":
            for y in [93, 104, 115]:
                line([(x + 23, y), (x + 39, y - 7), (x + 55, y), (x + 39, y + 7), (x + 23, y)], CYAN if y == 104 else MINT, 2)
        elif label == "Deploy":
            line([(x + 26, 109), (x + 26, 120), (x + 53, 120), (x + 53, 109)], CYAN, 2)
            line([(x + 39, 111), (x + 39, 88)], MINT, 2)
            line([(x + 30, 98), (x + 39, 88), (x + 48, 98)], MINT, 2)
        else:
            line([(x + 22, 93), (x + 22, 119), (x + 55, 119)], CYAN, 2)
            line([(x + 26, 110), (x + 34, 105), (x + 40, 109), (x + 48, 95), (x + 54, 98)], MINT, 2)
        phase = index / FRAME_COUNT
        active = int(phase * 4) % 4
        circle(x + 187, 70, 3, MINT if active == stages.index((x, label, subtitle)) else LINE)

    for connection in range(3):
        start = 240 + connection * 228
        line([(start, 109), (start + 24, 109)], CYAN, 2)
        line([(start + 18, 105), (start + 23, 109), (start + 18, 113)], CYAN, 1)
        progress = (index / FRAME_COUNT + connection / 3) % 1
        circle(start + 3 + progress * 18, 109, 3, MINT)

    line([(822, 164), (822, 193), (138, 193), (138, 164)], LINE, 1)
    line([(134, 171), (138, 165), (142, 171)], LINE, 1)
    progress = index / FRAME_COUNT
    circle(822 - progress * 684, 193, 3, CYAN)
    text(480, 217, "Small changes. Reliable releases. Better systems.", 11, MUTED)
    return image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    frames = [frame(index) for index in range(FRAME_COUNT)]
    frames[0].save(OUTPUT / "devops-pipeline-still.png", optimize=True)
    palette = frames[0].quantize(colors=96)
    gif_frames = [image.quantize(palette=palette, dither=Image.Dither.NONE) for image in frames]
    gif_frames[0].save(OUTPUT / "devops-pipeline.gif", save_all=True, append_images=gif_frames[1:], duration=125, loop=0, optimize=True, disposal=2)
    for name in ["devops-pipeline.gif", "devops-pipeline-still.png"]:
        print(f"{name}: {(OUTPUT / name).stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
