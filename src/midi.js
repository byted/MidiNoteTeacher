
class MidiConnector {
    constructor(onNoteStartHandler, onNoteEndHandler) {
        if (!navigator.requestMIDIAccess) {
            console.log('WebMIDI is not supported in this browser.');
            return false
        }
        this.onNoteStartHandler = onNoteStartHandler
        this.onNoteEndHandler = onNoteEndHandler

        navigator.requestMIDIAccess({ sysex: false }).then(
            // success
            (midiAccess) => midiAccess.inputs.forEach(i => i.onmidimessage = this._midiMessageHandler.bind(this)),
            // failure
            () => console.log('Could not access your MIDI devices.')
        );
    }

    _midiMessageHandler(message) {
        // Full mapping: https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
        const noteNames = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ]
        let cmd, note, velo
        [cmd, note, velo] = message.data
        const scale = ~~(note / 12) - 1
        const noteName = `${noteNames[(note % 12)]}/${scale}`;
        if(cmd === 144) {
            console.log(`Note ${noteName} on (velocity ${velo})`)
            this.onNoteStartHandler(noteName, note, velo)
        } else if (cmd === 128) {
            console.log(`Note ${noteName} off (velocity ${velo})`)
            this.onNoteEndHandler(noteName, note, velo)
        }
        
    }
}