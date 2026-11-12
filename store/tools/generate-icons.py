#!/usr/bin/env python3
"""Render the Script Vault toolbar/store icons (icons/icon-{16,32,48,128}.png).

Pure standard library (no Pillow needed). Geometry mirrors store/tools/icon.svg:
a warm gradient rounded square with a "</>"-style pair of chevrons.

Usage: python3 store/tools/generate-icons.py
"""
import math
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "icons"
SIZES = (16, 32, 48, 128)
SS = 4  # supersampling factor
TOP, BOTTOM = (201, 123, 66), (122, 74, 30)
FG = (255, 248, 238)


def dist_to_segment(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def in_rounded_rect(x, y, lo, hi, r):
    cx = min(max(x, lo + r), hi - r)
    cy = min(max(y, lo + r), hi - r)
    return lo <= x <= hi and lo <= y <= hi and math.hypot(x - cx, y - cy) <= r


# Geometry in a 128x128 coordinate space.
SEGMENTS = [
    (50, 38, 24, 64), (24, 64, 50, 90),
    (78, 38, 104, 64), (104, 64, 78, 90),
]
HALF_STROKE = 6


def sample(x, y):
    """Return (r, g, b, a) at a point in 128-space, a in {0,1}."""
    if not in_rounded_rect(x, y, 4, 124, 26):
        return (0, 0, 0, 0)
    if any(dist_to_segment(x, y, *s) <= HALF_STROKE for s in SEGMENTS):
        return FG + (1,)
    t = (x + y) / 256.0
    return tuple(round(TOP[i] + (BOTTOM[i] - TOP[i]) * t) for i in range(3)) + (1,)


def render(size):
    scale = 128.0 / (size * SS)
    rows = []
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(SS):
                for sx in range(SS):
                    r, g, b, a = sample((px * SS + sx + 0.5) * scale, (py * SS + sy + 0.5) * scale)
                    acc[0] += r * a; acc[1] += g * a; acc[2] += b * a; acc[3] += a
            n = SS * SS
            a = acc[3]
            if a == 0:
                row += bytes([0, 0, 0, 0])
            else:
                row += bytes([round(acc[0] / a), round(acc[1] / a), round(acc[2] / a), round(255 * a / n)])
        rows.append(bytes(row))
    return b"".join(rows)


def png(size, raw):
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9))
            + chunk(b"IEND", b""))


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for s in SIZES:
        (OUT / f"icon-{s}.png").write_bytes(png(s, render(s)))
        print(f"wrote icons/icon-{s}.png")
