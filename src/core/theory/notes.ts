import { NoteLetter, Accidental, NotePitch, Clef } from '../../types';

export const NOTE_LETTERS: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const NATURAL_SEMITONES: Record<NoteLetter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11
};

export function accidentalToSemitones(acc: Accidental): number {
  switch (acc) {
    case 'sharp': return 1;
    case 'flat': return -1;
    case 'natural': return 0;
  }
}

export function accidentalSymbol(acc: Accidental): string {
  switch (acc) {
    case 'sharp': return '♯';
    case 'flat': return '♭';
    case 'natural': return '';
  }
}

export function accidentalToVexFlow(acc: Accidental): string | null {
  switch (acc) {
    case 'sharp': return '#';
    case 'flat': return 'b';
    case 'natural': return 'n';
    default: return null;
  }
}

export function noteToMidi(note: NotePitch): number {
  const base = 12 * (note.octave + 1); // C4 is MIDI 60
  return base + NATURAL_SEMITONES[note.letter] + accidentalToSemitones(note.accidental);
}

export function formatNoteName(letter: NoteLetter, acc: Accidental, includeOctave = false, octave?: number): string {
  const name = `${letter}${accidentalSymbol(acc)}`;
  return includeOctave && octave !== undefined ? `${name}${octave}` : name;
}

export function getDefaultRootOctave(clef: Clef, letter: NoteLetter): number {
  if (clef === 'bass') {
    return ['A', 'B'].includes(letter) ? 2 : 3;
  }
  return ['A', 'B'].includes(letter) ? 3 : 4;
}

export function transposePitch(note: NotePitch, semitones: number, degreeStep: number): NotePitch {
  const letterIndex = NOTE_LETTERS.indexOf(note.letter);
  const targetIndex = (letterIndex + degreeStep) % 7;
  const octaveDelta = Math.floor((letterIndex + degreeStep) / 7);
  const targetLetter = NOTE_LETTERS[targetIndex < 0 ? targetIndex + 7 : targetIndex];
  const targetOctave = note.octave + octaveDelta;

  const currentMidi = noteToMidi(note);
  const desiredMidi = currentMidi + semitones;
  const naturalTargetMidi = 12 * (targetOctave + 1) + NATURAL_SEMITONES[targetLetter];
  const diff = desiredMidi - naturalTargetMidi;

  let acc: Accidental = 'natural';
  if (diff === 1) acc = 'sharp';
  else if (diff === -1) acc = 'flat';
  else if (diff >= 2) acc = 'sharp';
  else if (diff <= -2) acc = 'flat';

  return {
    letter: targetLetter,
    accidental: acc,
    octave: targetOctave
  };
}
