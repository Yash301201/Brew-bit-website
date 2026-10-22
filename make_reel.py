import json
import subprocess
from pathlib import Path

import imageio_ffmpeg

from photo_refresh import ROOT, STAGE


REEL_SCENES = [
    ("reel-cold-brew", "Orange cream cold brew", "INR 325"),
    ("reel-scramble", "Miso mushroom scramble", "INR 420"),
    ("reel-scone", "Kimchi cheddar scone", "INR 225"),
    ("reel-cake", "Dark chocolate olive oil cake", "INR 290"),
    ("reel-cafe", "Brew & Bite", "Good coffee. Better company."),
]


def main():
    extras = json.loads((STAGE / "extra-images.json").read_text(encoding="utf-8"))
    by_id = {extra["id"]: extra for extra in extras}
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    output = ROOT / "images" / "brew-bite-cafe-reel.mp4"
    temporary_output = output.with_name("brew-bite-cafe-reel.tmp.mp4")
    output.parent.mkdir(parents=True, exist_ok=True)
    command = [ffmpeg, "-y", "-hide_banner", "-loglevel", "error"]
    for slug, _, _ in REEL_SCENES:
        image = ROOT / by_id[slug]["image"]
        command.extend(["-loop", "1", "-framerate", "24", "-t", "2.5", "-i", str(image)])

    font_georgia = "C\\:/Windows/Fonts/georgia.ttf"
    font_arial = "C\\:/Windows/Fonts/arial.ttf"
    filters = []
    for index, (_, title, detail) in enumerate(REEL_SCENES):
        title = title.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")
        detail = detail.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")
        filters.append(
            f"[{index}:v]scale=1024:768:force_original_aspect_ratio=increase,"
            "crop=1024:768,zoompan=z='min(zoom+0.0006,1.045)':"
            "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=960x720:fps=24,"
            "setsar=1,drawbox=x=0:y=590:w=960:h=130:color=0x1d2a20@0.72:t=fill,"
            f"drawtext=fontfile='{font_georgia}':text='{title}':fontcolor=white:"
            "fontsize=31:x=(w-text_w)/2:y=620,"
            f"drawtext=fontfile='{font_arial}':text='{detail}':fontcolor=0xe4c9a4:"
            "fontsize=19:x=(w-text_w)/2:y=666,format=yuv420p[v"
            f"{index}]"
        )
    previous = "v0"
    for index in range(1, len(REEL_SCENES)):
        next_label = f"mix{index}"
        offset = 1.95 * index
        filters.append(
            f"[{previous}][v{index}]xfade=transition=fade:duration=0.55:"
            f"offset={offset:.2f}[{next_label}]"
        )
        previous = next_label
    command.extend([
        "-filter_complex", ";".join(filters),
        "-map", f"[{previous}]",
        "-an",
        "-r", "24",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(temporary_output),
    ])
    subprocess.run(command, check=True)
    if temporary_output.stat().st_size < 50_000:
        raise RuntimeError("The generated café reel is unexpectedly small.")
    subprocess.run([ffmpeg, "-v", "error", "-i", str(temporary_output), "-f", "null", "-"], check=True)
    temporary_output.replace(output)
    print(f"Created original café reel: {output}")


if __name__ == "__main__":
    main()
