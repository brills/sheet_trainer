import { Renderer, Stave, StaveNote, Accidental as VexAccidental, Formatter, Beam, Voice, Fraction } from 'vexflow';
import { ChordDefinition, ArpeggioDefinition, KeySignatureDefinition } from '../types';
import { accidentalToVexFlow } from '../core/theory/notes';
import { getRequiredAccidentalForNote } from '../core/theory/keys';
import { THEME_COLORS } from '../theme/tokens';

export interface RenderOptions {
  width?: number;
  height?: number;
  strokeColor?: string;
  clef?: 'treble' | 'bass';
  keySignature?: KeySignatureDefinition;
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

  // Initialize VexFlow SVG Renderer
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();

  // Color styling from theme design tokens
  const strokeColor = options.strokeColor || THEME_COLORS.notehead;
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

  // Apply Key Signature to Stave if present
  const keySig = options.keySignature || chord.keySignature;
  if (keySig && keySig.vexKey) {
    try {
      stave.addKeySignature(keySig.vexKey);
    } catch {
      // Fallback for non-standard key specs
    }
  }

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
    duration: 'w'
  });

  // Attach accidentals: Only for notes that differ from the active key signature!
  chord.notes.forEach((note, idx) => {
    const requiredAcc = getRequiredAccidentalForNote(note, keySig);
    if (requiredAcc) {
      const accChar = accidentalToVexFlow(requiredAcc);
      if (accChar) {
        const acc = new VexAccidental(accChar);
        acc.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
        staveNote.addModifier(acc, idx);
      }
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

  // Center the chord + accidentals group within available space to right of clef/keySig
  const noteStartX = stave.getNoteStartX();
  const noteEndX = stave.getNoteEndX();
  const modWidth = (staveNote.getModifierContext() as any)?.state?.left_shift || 0;
  const noteHeadWidth = 15;
  const totalChordWidth = modWidth + noteHeadWidth;
  const availableWidth = noteEndX - noteStartX;
  const extraSpace = availableWidth - totalChordWidth;

  const centerShift = Math.max(0, Math.floor(extraSpace / 2));
  const tickContext = staveNote.getTickContext();
  if (tickContext && centerShift > 0) {
    tickContext.setX(tickContext.getX() + centerShift);
  }

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

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();

  const strokeColor = options.strokeColor || THEME_COLORS.notehead;
  context.setStrokeStyle(strokeColor);
  context.setFillStyle(strokeColor);

  const staveX = 10;
  const staveY = 20;
  const staveWidth = width - 20;
  const stave = new Stave(staveX, staveY, staveWidth);

  const clef = options.clef || (arpeggio.clef === 'bass' ? 'bass' : 'treble');
  stave.addClef(clef);

  const keySig = options.keySignature || arpeggio.keySignature;
  if (keySig && keySig.vexKey) {
    try {
      stave.addKeySignature(keySig.vexKey);
    } catch {
      // Fallback
    }
  }

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
      duration: duration,
      auto_stem: true
    });

    const requiredAcc = getRequiredAccidentalForNote(note, keySig);
    if (requiredAcc) {
      const accChar = accidentalToVexFlow(requiredAcc);
      if (accChar) {
        const acc = new VexAccidental(accChar);
        acc.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
        sn.addModifier(acc, 0);
      }
    }

    sn.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor });
    if (typeof sn.setLedgerLineStyle === 'function') {
      sn.setLedgerLineStyle({ fillStyle: strokeColor, strokeStyle: strokeColor, lineWidth: 1.5 });
    }
    return sn;
  });

  // Generate unified beam with synchronized stem direction across the arpeggio group
  let beams: Beam[] = [];
  if (arpeggio.isBeamed && staveNotes.length > 1) {
    try {
      beams = Beam.generateBeams(staveNotes, {
        groups: [new Fraction(staveNotes.length, 8)]
      });
      beams.forEach(b => b.setStyle({ fillStyle: strokeColor, strokeStyle: strokeColor }));
    } catch {
      // Fallback
    }
  }

  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.setStrict(false);
  voice.addTickables(staveNotes);

  // In standard music engraving, arpeggios occupy a compact measure width rather than stretching across the entire stave
  const availableWidth = Math.max(50, stave.getNoteEndX() - stave.getNoteStartX() - 15);
  const justifyWidth = Math.min(availableWidth, Math.max(70, staveNotes.length * (width < 200 ? 24 : 38)));
  new Formatter().joinVoices([voice]).format([voice], justifyWidth);

  voice.draw(context, stave);

  beams.forEach(b => {
    try {
      b.setContext(context).draw();
    } catch {
      // Ignore draw errors
    }
  });
}
