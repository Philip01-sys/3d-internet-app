"""Synthesize every sound used in the claymation video.

All audio is generated from scratch (no samples), so the soundtrack has no
licensing strings attached and can be regenerated or tweaked at will:

    python3 scripts/make_audio.py      # writes public/sfx/*.wav

Requires only numpy.
"""

import math
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t_axis(seconds):
    return np.arange(int(seconds * SR)) / SR


def save(name, x, peak=0.9):
    x = np.asarray(x, dtype=np.float64)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    print(f"wrote {name}  {len(x) / SR:.2f}s")


def one_pole_lowpass(x, cutoff):
    a = math.exp(-2 * math.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def bandpass(x, centre, q):
    """Resonant band-pass biquad; `centre` may be a per-sample array (sweeps)."""
    centre = np.broadcast_to(np.asarray(centre, dtype=np.float64), x.shape)
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i in range(len(x)):
        w0 = 2 * math.pi * centre[i] / SR
        alpha = math.sin(w0) / (2 * q)
        b0, a0 = alpha, 1 + alpha
        a1, a2 = -2 * math.cos(w0), 1 - alpha
        v = (b0 * x[i] - b0 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1 = x1, x[i]
        y2, y1 = y1, v
        y[i] = v
    return y


def fade(x, fin=0.005, fout=0.02):
    n_in, n_out = int(fin * SR), int(fout * SR)
    env = np.ones_like(x)
    if n_in:
        env[:n_in] = np.linspace(0, 1, n_in)
    if n_out:
        env[-n_out:] = np.linspace(1, 0, n_out)
    return x * env


# --------------------------------------------------------------------------
# Pops: a quick upward "bloop" with a tiny click, like clay leaving the desk.
def pop(base):
    t = t_axis(0.16)
    f = base * (1 + 1.6 * (1 - np.exp(-t / 0.025)))  # fast upward chirp
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * np.exp(-t / 0.035)
    sub = 0.5 * np.sin(phase * 0.5) * np.exp(-t / 0.05)
    click = rng.normal(0, 1, len(t)) * np.exp(-t / 0.002) * 0.4
    return fade(body + sub + click, 0.001, 0.03)


# --------------------------------------------------------------------------
# Stretch + yawn: a rubbery creak gliding up then down, over a breathy "haaa".
def stretch():
    t = t_axis(1.0)
    glide = 170 + 150 * np.sin(np.pi * np.clip(t / 0.75, 0, 1)) ** 1.5
    phase = 2 * np.pi * np.cumsum(glide) / SR
    rough = 1 + 0.6 * np.sin(2 * np.pi * 28 * t + 3 * np.sin(2 * np.pi * 3 * t))  # rubber judder
    creak = np.sin(phase) * 0.6 + np.sin(2 * phase) * 0.25 + np.sin(3 * phase) * 0.1
    creak *= rough * np.sin(np.pi * np.clip(t / 0.85, 0, 1)) ** 0.8
    breath = bandpass(rng.normal(0, 1, len(t)), 650 + 250 * np.sin(np.pi * t), 3.0)
    breath *= np.sin(np.pi * np.clip((t - 0.15) / 0.8, 0, 1)) ** 1.5 * 2.2
    return fade(one_pole_lowpass(creak * 0.7 + breath, 3200), 0.02, 0.1)


# --------------------------------------------------------------------------
# Whoosh: band-passed noise sweeping up and back down as a block appears.
def whoosh():
    t = t_axis(0.7)
    sweep = 300 + 2600 * np.sin(np.pi * np.clip(t / 0.6, 0, 1)) ** 2
    x = bandpass(rng.normal(0, 1, len(t)), sweep, 1.4)
    env = np.sin(np.pi * np.clip(t / 0.65, 0, 1)) ** 2
    return fade(x * env, 0.005, 0.05)


# --------------------------------------------------------------------------
# Hum: warm low drone with slow beating and a faint shimmer, for the glow.
def hum(seconds=7.0):
    t = t_axis(seconds)
    x = (
        np.sin(2 * np.pi * 110 * t)
        + 0.8 * np.sin(2 * np.pi * 110.6 * t)  # detune -> gentle beating
        + 0.45 * np.sin(2 * np.pi * 220 * t)
        + 0.18 * np.sin(2 * np.pi * 330.4 * t)
        + 0.06 * np.sin(2 * np.pi * 880 * t + np.sin(2 * np.pi * 0.7 * t))
    )
    x *= 1 + 0.15 * np.sin(2 * np.pi * 0.5 * t)
    return fade(x, 0.4, 1.0)


# --------------------------------------------------------------------------
# Acoustic guitar via Karplus-Strong plucked-string synthesis.
def pluck(freq, seconds, decay=0.996, bright=0.6, amp=1.0):
    n = int(SR / freq)
    total = int(seconds * SR)
    y = np.zeros(total + n + 1)
    burst = rng.uniform(-1, 1, n)
    burst = one_pole_lowpass(burst, 1500 + 5000 * bright)  # softer pick = darker
    y[1 : n + 1] = burst  # y[0] is a zero pad so y[k-n-1] is always valid
    k = n + 1
    while k < total + 1:
        m = min(n, total + 1 - k)
        y[k : k + m] = decay * 0.5 * (y[k - n : k - n + m] + y[k - n - 1 : k - n - 1 + m])
        k += m
    out = y[1 : total + 1] * amp
    return fade(out, 0.002, 0.05)


NOTE = {"C2": 65.41, "E2": 82.41, "F2": 87.31, "G2": 98.0, "A2": 110.0, "B2": 123.47,
        "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.0, "A3": 220.0,
        "B3": 246.94, "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.0, "A4": 440.0}

# Bars of (bass, three upper chord tones), C - G/B - Am - F, a warm folk loop.
CHORDS = [
    ("C3", ["E3", "G3", "C4"]),
    ("B2", ["D3", "G3", "B3"]),
    ("A2", ["E3", "A3", "C4"]),
    ("F2", ["F3", "A3", "C4"]),
]
# Travis-style picking over 8 eighth-notes: bass, high, mid, high, bass, high, mid, top.
PATTERN = [("bass", 0), ("up", 2), ("up", 1), ("up", 2), ("bass", 0), ("up", 2), ("up", 1), ("up", 0)]


def music(seconds=20.0, bpm=100):
    eighth = 60 / bpm / 2
    bar = eighth * 8
    mix = np.zeros(int((seconds + 3) * SR))
    for b in range(int(math.ceil(seconds / bar))):
        bass, upper = CHORDS[b % len(CHORDS)]
        for i, (kind, idx) in enumerate(PATTERN):
            start = b * bar + i * eighth
            if start >= seconds:
                break
            # Gentle humanised timing and dynamics
            start += rng.normal(0, 0.006)
            if kind == "bass":
                note = pluck(NOTE[bass], 2.4, decay=0.997, bright=0.35, amp=0.9)
            else:
                note = pluck(NOTE[upper[idx]], 1.8, decay=0.995, bright=0.55, amp=0.55 + rng.uniform(-0.08, 0.08))
            s = int(start * SR)
            mix[s : s + len(note)] += note
        # A soft brushed shaker on the off-beats
        for i in range(1, 8, 2):
            s = int((b * bar + i * eighth) * SR)
            n = int(0.06 * SR)
            if s + n < len(mix):
                tick = rng.normal(0, 1, n) * np.exp(-np.arange(n) / (0.012 * SR)) * 0.05
                mix[s : s + n] += bandpass(tick, 6000, 1.0)
    mix = one_pole_lowpass(mix[: int(seconds * SR)], 6000)  # warm "body" tone
    return fade(mix, 0.05, 1.5)


if __name__ == "__main__":
    for i, base in enumerate([360, 450, 540]):
        save(f"pop-{i + 1}.wav", pop(base))
    save("stretch.wav", stretch(), peak=0.8)
    save("whoosh.wav", whoosh(), peak=0.8)
    save("hum.wav", hum(), peak=0.7)
    save("music.wav", music(), peak=0.85)
