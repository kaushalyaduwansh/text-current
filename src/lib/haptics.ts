"use client";

/**
 * Haptic feedback utilities for correct/wrong answer vibrations.
 * Uses the Vibration API where available (mobile browsers).
 */

export function vibrateCorrect() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(50); // Short subtle pulse
  }
}

export function vibrateWrong() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([80, 60, 80]); // Double pulse pattern
  }
}

export function vibrateLight() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(20); // Very light tap
  }
}
