const VF = Vex.Flow;
const containerId = 'sheet'

class Sheet {
    constructor(containerId) {
        this.container = document.getElementById(containerId)
        this._initSheet()
    }

    _initSheet() {
        this.renderer = new VF.Renderer(this.container, VF.Renderer.Backends.SVG);
        this.renderer.resize(300, 120);
        this.context = this.renderer.getContext();
        this.stave = new VF.Stave(0, 0, 280).setContext(this.context);
        this.tickContext = new VF.TickContext();
        this.tickContext.x = 150 // show the note further away from the clef to make it visually a bit harder
    }

    _noteFactory(noteNotation) {
        const note = new Vex.Flow.StaveNote({
            keys: [`${noteNotation}`],
            duration: '1',
            clef: this.stave.clef
         })
        this.tickContext.addTickable(note)
        return note.setContext(this.context).setStave(this.stave)
    }
    
    resetSheet(clef) {
        this.context.clear()
        this.stave.setClef(clef)
        this.stave.draw()
    }

    addNote(noteNotation, color='black') {
        const group = this.context.openGroup()
        const note = this._noteFactory(noteNotation)
        note.setStyle({ fillStyle: color, strokeStyle: color})
        note.draw()
        this.context.closeGroup()  
        return [note, group]
    }

    updateNoteColor(note, color) {
        note.setStyle({ fillStyle: color, strokeStyle: color})
        note.draw()
    }

}

class Notifier {
    constructor(elemId, duration=null) {
        this.container = document.getElementById(elemId)
        this.duration = duration
    }

    _removeIfDuration(el) {
        if(this.duration !== null) {
            setTimeout(() => { el.remove() }, this.duration)
        }
    }

    show(content, { prepend = false, isHtml = false } = {}) {
        const el = document.createElement('div')
        
        if(isHtml) {
            el.innerHTML = content
        } else {
            el.appendChild(document.createTextNode(content))
        }

        if(prepend && this.container.firstChild) {
            this.container.insertBefore(el, this.container.firstChild)
        } else {
            this.container.appendChild(el)
        }
        
        this.container.appendChild(el)
        this._removeIfDuration(el)
    }

    clear() {
        this.container.innerHTML = ''
    }
}