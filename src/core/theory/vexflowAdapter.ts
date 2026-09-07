import { Renderer, Stave, StaveNote, Accidental as VexAccidental, Formatter, Beam, Voice } from 'vexflow';
import { ChordDefinition, ArpeggioDefinition } from '../../types';
import { accidentalToVexFlow } from './notes';

export interface RenderOptions {
  width?: number;
  height?: number;
  darkMode?: boolean;
}

export function renderChordToSvg(
  container: HTMLDivElement,
  chord: ChordDefinition,
  options: RenderOptions = {}
): void {
  // Clear previous contents
  container.innerHTML = '';

  const width = options.width || 340;
  const height = options.height || 180;
  const isDark = options.darkMode !== false;

  // Initialize VexFlow SVG Renderer
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();

  // Style colors
  const strokeColor = isDark ? '#e2e8f0' : '#1e293b'; // slate-200 / slate-800
  context.setStrokeStyle(strokeColor);
  context.setFillStyle(strokeColor);

  // Position stave centered in box
  const staveX = 20;
  const staveY = 25;
  const staveWidth = width - 40;
  const stave = new Stave(staveX, staveY, staveWidth);

  // Set clef
  stave.addClef(chord.clef === 'bass' ? 'bass' : 'treble');
  stave.setContext(context).draw();

  // Map notes to VexFlow keys: e.g., ["c/4", "e/4", "g/4"]
  const keys = chord.notes.map(n => `${n.letter.toLowerCase()}/${n.octave}`);

  const staveNote = new StaveNote({
    clef: chord.clef === 'bass' ? 'bass' : 'treble',
    keys: keys,
    duration: 'w', // Whole note for blocked chord
    align_center: true
  });

  // Attach accidentals to respective note indices
  chord.notes.forEach((note, idx) => {
    const accChar = accidentalToVexFlow(note.accidental);
    if (accChar && accChar !== 'n') {
      staveNote.addModifier(new VexAccidental(accChar), idx);
    }
  });

  // Format note styling
  staveNote.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });

  // Voice & Formatter
  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.setStrict(false);
  voice.addTickables([staveNote]);

  new Formatter().joinVoices([voice]).format([voice], staveWidth - 70);
  voice.draw(context, stave);
}

export function renderArpeggioToSvg(
  container: HTMLDivElement,
  arpeggio: ArpeggioDefinition,
  options: RenderOptions = {}
): void {
  container.innerHTML = '';

  const width = options.width || 380;
  const height = options.height || 180;
  const isDark = options.darkMode !== false;

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();

  const strokeColor = isDark ? '#e2e8f0' : '#1e293b';
  context.setStrokeStyle(strokeColor);
  context.setFillStyle(strokeColor);

  const staveX = 20;
  const staveY = 25;
  const staveWidth = width - 40;
  const stave = new Stave(staveX, staveY, staveWidth);

  stave.addClef(arpeggio.clef === 'bass' ? 'bass' : 'treble');
  stave.setContext(context).draw();

  const duration = '8';

  const staveNotes = arpeggio.notes.map(note => {
    const key = `${note.letter.toLowerCase()}/${note.octave}`;
    const sn = new StaveNote({
      clef: arpeggio.clef === 'bass' ? 'bass' : 'treble',
      keys: [key],
      duration: duration
    });

    const accChar = accidentalToVexFlow(note.accidental);
    if (accChar && accChar !== 'n') {
      sn.addModifier(new VexAccidental(accChar), 0);
    }

    sn.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
    return sn;
  });

  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.setStrict(false);
  voice.addTickables(staveNotes);

  new Formatter().joinVoices([voice]).format([voice], staveWidth - 80);

  voice.draw(context, stave);

  if (arpeggio.isBeamed && staveNotes.length > 1) {
    try {
      const beam = new Beam(staveNotes);
      beam.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
      beam.setContext(context).draw();
    } catch {
      // Ignore beam layout exceptions on edge intervals
    }
  }
}
