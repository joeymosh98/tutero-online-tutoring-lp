"""
Lo-fi acoustic — nylon guitar + soft kick.
Warm sunshine loop, no snaps, no big melodies.

- 22s total (matches extended composition)
- Whisper-quiet during VO (0–15.3s)
- Ducks again for contracts VO (15.6–18.5s)
- Full warmth on silent hold (18.5–22s)
"""

import wave
import struct
import math
import random

SAMPLE_RATE = 44100
DURATION = 22.0
NUM_SAMPLES = int(SAMPLE_RATE * DURATION)
BPM = 100
BEAT = 60.0 / BPM  # 0.6s

random.seed(42)  # deterministic


def note_freq(name: str) -> float:
    notes = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    n = name[0]
    octave = int(name[-1])
    midi = 12 * (octave + 1) + notes[n]
    return 440.0 * (2 ** ((midi - 69) / 12.0))


# ── Nylon-string guitar pluck ────────────────────────────────────────────────
def nylon_pluck(freq: float, t: float) -> float:
    """
    Warm, round nylon guitar tone.
    Soft attack, quick-ish decay, muted upper harmonics.
    """
    if t < 0:
        return 0.0
    # Soft attack (no hard pick transient)
    attack = min(1.0, t / 0.012)
    # Natural guitar decay
    decay = math.exp(-t * 2.2)
    env = attack * decay

    # Fundamental (dominant — nylon is warm)
    sig = math.sin(2 * math.pi * freq * t)
    # 2nd harmonic (gentle)
    sig += 0.35 * math.sin(2 * math.pi * freq * 2 * t) * math.exp(-t * 3.5)
    # 3rd harmonic (very soft — nylon doesn't ring bright)
    sig += 0.12 * math.sin(2 * math.pi * freq * 3 * t) * math.exp(-t * 5)
    # Slight body resonance (low thump)
    sig += 0.15 * math.sin(2 * math.pi * 82 * t) * math.exp(-t * 8)

    return sig * env


# ── Finger snap ───────────────────────────────────────────────────────────────
def finger_snap(t: float, seed: int = 0) -> float:
    """
    Short, crisp snap — filtered noise burst with a tonal ping.
    """
    if t < 0 or t > 0.08:
        return 0.0
    # Sharp attack, fast decay
    env = math.exp(-t * 55)
    # Tonal ping around 2-3kHz (snap resonance)
    ping = math.sin(2 * math.pi * 2600 * t + seed) * 0.6
    ping += math.sin(2 * math.pi * 3400 * t + seed * 1.3) * 0.3
    # Noise component
    noise = 0.0
    for k in range(5):
        noise += math.sin(t * (4217 + k * 1731 + seed * 7)) * 0.2
    return (ping + noise) * env


# ── Soft kick ─────────────────────────────────────────────────────────────────
def soft_kick(t: float) -> float:
    """Pillowy low thump — felt more than heard."""
    if t < 0 or t > 0.12:
        return 0.0
    freq = 65 * math.exp(-t * 15)
    env = math.exp(-t * 10)
    return math.sin(2 * math.pi * freq * t) * env


# ── Volume curve ──────────────────────────────────────────────────────────────
def volume_curve(t: float) -> float:
    if t < 14.5:
        return 0.10                                       # under main VO
    elif t < 15.6:
        progress = (t - 14.5) / 1.1
        return 0.10 + 0.15 * (progress ** 0.7)           # gentle rise
    elif t < 18.5:
        return 0.15                                       # duck for contracts VO
    elif t < 19.5:
        progress = (t - 18.5) / 1.0
        return 0.15 + 0.25 * (progress ** 0.6)           # swell up after VO ends
    else:
        return 0.38 + 0.03 * math.sin((t - 19.5) * 0.9) # warm hold


# ── Chord progression: C → G → Am → F (the sunshine loop) ────────────────────
# Each chord = 2 beats, cycling
CHORDS = [
    # C major
    [('E3', 0.0), ('C4', 0.0), ('E4', 0.0), ('G4', 0.0)],
    # G major
    [('G3', 0.0), ('B3', 0.0), ('D4', 0.0), ('G4', 0.0)],
    # Am
    [('A3', 0.0), ('C4', 0.0), ('E4', 0.0), ('A4', 0.0)],
    # F major
    [('F3', 0.0), ('A3', 0.0), ('C4', 0.0), ('F4', 0.0)],
]

# Strum patterns — which strings to pluck per 8th note within a 2-beat group
# (indices into the 4-string chord voicing)
# Classic fingerpicking: bass, treble pair, bass, treble pair
PATTERN_A = [
    (0.0,    [0]),        # beat 1: bass note
    (0.5,    [2, 3]),     # &: two trebles together
    (1.0,    [1]),        # beat 2: mid note
    (1.5,    [2, 3]),     # &: trebles again
]


def add_sample(samples: list, idx: int, value: float):
    if 0 <= idx < len(samples):
        samples[idx] += value


def generate():
    samples = [0.0] * NUM_SAMPLES

    # ── Layer 1: Nylon guitar fingerpicking ───────────────────────────────
    # 4 chords, each lasting 2 beats, repeating
    chord_duration = BEAT * 2  # each chord = 2 beats
    full_cycle = chord_duration * 4  # 4 chords per cycle

    t_pos = 0.0
    while t_pos < DURATION:
        cycle_pos = t_pos % full_cycle
        chord_idx = int(cycle_pos / chord_duration) % 4
        chord = CHORDS[chord_idx]

        local_in_chord = cycle_pos - chord_idx * chord_duration

        for beat_offset, string_indices in PATTERN_A:
            note_time = t_pos + beat_offset * BEAT
            if note_time >= DURATION:
                break

            vol = volume_curve(note_time)

            for si in string_indices:
                note_name = chord[si][0]
                freq = note_freq(note_name)
                i_start = int(note_time * SAMPLE_RATE)
                ring = 0.8  # notes ring for ~0.8s
                i_end = min(int((note_time + ring) * SAMPLE_RATE), NUM_SAMPLES)

                for i in range(max(0, i_start), i_end):
                    t_local = (i - i_start) / SAMPLE_RATE
                    add_sample(samples, i, nylon_pluck(freq, t_local) * vol * 0.55)

        t_pos += chord_duration

    # ── Layer 2: Soft kick on beat 1 only ─────────────────────────────────
    beat_num = 0
    t_pos = 0.0
    while t_pos < DURATION:
        beat_in_bar = beat_num % 4
        if beat_in_bar == 0:
            vol = volume_curve(t_pos)
            kick_vol = vol * 0.45
            i_start = int(t_pos * SAMPLE_RATE)
            kick_dur = int(0.13 * SAMPLE_RATE)
            for i in range(kick_dur):
                t_local = i / SAMPLE_RATE
                add_sample(samples, i_start + i,
                           soft_kick(t_local) * kick_vol)

        t_pos += BEAT
        beat_num += 1

    # ── Reverb (warm room) ────────────────────────────────────────────────
    delays = [
        (int(0.07 * SAMPLE_RATE), 0.18),
        (int(0.15 * SAMPLE_RATE), 0.10),
        (int(0.28 * SAMPLE_RATE), 0.05),
    ]
    for delay, gain in delays:
        for i in range(delay, NUM_SAMPLES):
            samples[i] += samples[i - delay] * gain

    # ── Normalize ─────────────────────────────────────────────────────────
    peak = max(abs(s) for s in samples) or 1.0
    samples = [s * (0.90 / peak) for s in samples]

    # ── Write WAV ─────────────────────────────────────────────────────────
    out_path = '/Users/josephmoshinsky/.21st/repos/joeymosh98/tutero-online-tutoring-lp/ads/video/tutero-seedance-ad/public/music-bg.wav'
    with wave.open(out_path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        for s in samples:
            wf.writeframes(struct.pack('<h', int(s * 32767)))

    print(f"Generated {out_path}")
    print(f"  Duration: {DURATION}s | BPM: {BPM} | Style: lo-fi acoustic + finger snaps")


if __name__ == '__main__':
    generate()
