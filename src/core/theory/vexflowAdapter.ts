import { Renderer, Stave, StaveNote, Accidental as VexAccidental, Formatter, Beam, Voice } from 'vexflow';
import { ChordDefinition, ArpeggioDefinition } from '../../types';
import { accidentalToVexFlow } from './notes';

export interface RenderOptions {
  width?: number;
  height?: number;
  darkMode?: boolean;
  strokeColor?: string;
  clef?: 'treble' | 'bass';
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

  // Style colors: high contrast slate-100 for dark mode, or explicit override
  const strokeColor = options.strokeColor || (isDark ? '#f8fafc' : '#0f172a');
  context.setStrokeStyle(strokeColor);
  context.setFillStyle(strokeColor);

  // Position stave centered in box
  const staveX = 10;
  const staveY = 20;
  const staveWidth = width - 20;
  const stave = new Stave(staveX, staveY, staveWidth);

  // Set clef and styling for lines and ledger lines
  const clef = options.clef || (chord.clef === 'bass' ? 'bass' : 'treble');
  stave.addClef(clef);
  stave.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
  
  if (typeof (stave as any).setLedgerLineStyle === 'function') {
    (stave as any).setLedgerLineStyle({ fillStyle: strokeColor, strokeStyle: strokeColor, lineWidth: 1.5 });
  }

  stave.setContext(context).draw();

  // Map notes to VexFlow keys: e.g., ["c/4", "e/4", "g/4"]
  const keys = chord.notes.map(n => `${n.letter.toLowerCase()}/${n.octave}`);

  const staveNote = new StaveNote({
    clef: clef,
    keys: keys,
    duration: 'w',
    align_center: true
  });

  // Attach accidentals to respective note indices
  chord.notes.forEach((note, idx) => {
    const accChar = accidentalToVexFlow(note.accidental);
    if (accChar && accChar !== 'n') {
      const acc = new VexAccidental(accChar);
      acc.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
      staveNote.addModifier(acc, idx);
    }
  });

  // Format note & ledger line styling
  staveNote.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
  if (typeof staveNote.setLedgerLineStyle === 'function') {
    staveNote.setLedgerLineStyle({ fillStyle: strokeColor, strokeStyle: strokeColor, lineWidth: 1.5 });
  }

  // Voice & Formatter
  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.setStrict(false);
  voice.addTickables([staveNote]);

  new Formatter().joinVoices([voice]).format([voice], staveWidth - 60);
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

  const strokeColor = options.strokeColor || (isDark ? '#f8fafc' : '#0f172a');
  context.setStrokeStyle(strokeColor);
  context.setFillStyle(strokeColor);

  const staveX = 10;
  const staveY = 20;
  const staveWidth = width - 20;
  const stave = new Stave(staveX, staveY, staveWidth);

  const clef = options.clef || (arpeggio.clef === 'bass' ? 'bass' : 'treble');
  stave.addClef(clef);
  stave.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
  
  if (typeof (stave as any).setLedgerLineStyle === 'function') {
    (stave as any).setLedgerLineStyle({ fillStyle: strokeColor, strokeStyle: strokeColor, lineWidth: 1.5 });
  }

  stave.setContext(context).draw();

  const duration = '8';

  const staveNotes = arpeggio.notes.map(note => {
    const key = `${note.letter.toLowerCase()}/${note.octave}`;
    const sn = new StaveNote({
      clef: clef,
      keys: [key],
      duration: duration
    });

    const accChar = accidentalToVexFlow(note.accidental);
    if (accChar && accChar !== 'n') {
      const acc = new VexAccidental(accChar);
      acc.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
      sn.addModifier(acc, 0);
    }

    sn.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
    if (typeof sn.setLedgerLineStyle === 'function') {
      sn.setLedgerLineStyle({ fillStyle: strokeColor, strokeStyle: strokeColor, lineWidth: 1.5 });
    }
    return sn;
  });

  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.setStrict(false);
  voice.addTickables(staveNotes);

  new Formatter().joinVoices([voice]).format([voice], staveWidth - 70);

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
