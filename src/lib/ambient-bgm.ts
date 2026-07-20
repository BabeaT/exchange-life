let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let musicTimer: ReturnType<typeof setInterval> | null = null
let chordIndex = 0
let playing = false
let volume = 0.42

const chords = [
  [220, 329.63, 493.88],
  [196, 293.66, 440],
  [174.61, 261.63, 392],
  [196, 329.63, 493.88],
]

function ensureAudioGraph() {
  if (audioContext && masterGain) return
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return
  audioContext = new AudioContextClass()
  masterGain = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1100
  masterGain.gain.value = 0
  masterGain.connect(filter)
  filter.connect(audioContext.destination)
}

function playChord() {
  if (!audioContext || !masterGain || !playing) return
  const now = audioContext.currentTime
  const notes = chords[chordIndex % chords.length]
  chordIndex += 1

  notes.forEach((frequency, index) => {
    const oscillator = audioContext!.createOscillator()
    const noteGain = audioContext!.createGain()
    oscillator.type = index === 0 ? 'sine' : 'triangle'
    oscillator.frequency.value = frequency
    oscillator.detune.value = index === 1 ? -4 : index === 2 ? 5 : 0
    noteGain.gain.setValueAtTime(0.0001, now)
    noteGain.gain.exponentialRampToValueAtTime(0.12 / (index + 1), now + 1.8 + index * 0.15)
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.2)
    oscillator.connect(noteGain)
    noteGain.connect(masterGain!)
    oscillator.start(now + index * 0.12)
    oscillator.stop(now + 7.4)
  })
}

export const ambientBgm = {
  async play() {
    ensureAudioGraph()
    if (!audioContext || !masterGain) return false
    playing = true
    await audioContext.resume()
    masterGain.gain.cancelScheduledValues(audioContext.currentTime)
    masterGain.gain.setTargetAtTime(volume * 0.055, audioContext.currentTime, 0.8)
    if (!musicTimer) {
      playChord()
      musicTimer = setInterval(playChord, 6200)
    }
    return true
  },
  pause() {
    playing = false
    if (musicTimer) clearInterval(musicTimer)
    musicTimer = null
    if (audioContext && masterGain) {
      masterGain.gain.cancelScheduledValues(audioContext.currentTime)
      masterGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.25)
    }
  },
  setVolume(nextVolume: number) {
    volume = Math.min(1, Math.max(0, nextVolume))
    if (audioContext && masterGain && playing) masterGain.gain.setTargetAtTime(volume * 0.055, audioContext.currentTime, 0.18)
  },
  isPlaying() {
    return playing
  },
}
