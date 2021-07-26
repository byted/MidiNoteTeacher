class Teacher {
    constructor(sheet, instrument) {
        this.clefsToTeach = ['bass', 'treble']
        this.notesToTeach = {
            bass: ['C/2', 'D/2', 'E/2', 'F/2', 'G/2', 'A/2', 'B/2', 'C/3', 'D/3', 'E/3', 'F/3', 'G/3', 'A/3', 'B/3', 'C/4', 'D/4', 'E/4'],
            treble: ['A/3', 'B/3', 'C/4', 'D/4', 'E/4', 'F/4', 'G/4', 'A/4', 'B/4', 'C/5', 'D/5', 'E/5', 'F/5', 'G/5', 'A/5', 'B/5', 'C/6']
        }
        this.tasksStats = []
        this.sheet = sheet
        this.instrument = instrument
        this._showStats(0, 0, '-')
    }

    _showStats(count, errorCount, duration) {
        stats.show(`
            <table>
                <tr><td>Solved:</td><td>${count}</td></tr>
                <tr><td>⌀ errors:</td><td>${Number(errorCount).toFixed(2)}</td></tr>
                <tr><td>⌀ duration: </td><td>${typeof duration === 'number' ? Number(duration).toFixed(2) + ' s' : duration}</td></tr>
            </table>
        `, { isHtml: true })
    }

    nextTask() {
        // currently no check if there is already a task ongoing!
        const clefToLearn = this.clefsToTeach.getRandom()
        const noteToLearn = this.notesToTeach[clefToLearn].getRandom()
        const t = new Task(this.sheet, noteToLearn, clefToLearn, this.giveFeedback.bind(this), this.prepareNextTask.bind(this))
        this.instrument.onNoteStartHandler = (note) => { t.handleSolutionAttemptStart(`${note}`) },
        this.instrument.onNoteEndHandler = (note) => { t.handleSolutionAttemptEnd() }
        this.tasksStats.unshift({
            clef: clefToLearn,
            note: noteToLearn
        })
    }

    giveFeedback(task) {
        successNotifier.show(
            `<b>${task.expectedNoteNotation}</b> correct in <b>${task.duration/1000} s</b> (${task.wrongAttempts} errors)`,
            { isHtml: true, prepend: true }
        )
        this.tasksStats[0]['duration'] = task.duration
    }

    prepareNextTask(task) {
        // get stats from current taks
        this.tasksStats[0]['wrongAttempts'] = task.wrongAttempts
        this.updateStats()
        setTimeout(() => {
            this.nextTask()
        }, 500)
    }

    updateStats() {
        let durs = 0
        let errs = 0
        this.tasksStats.forEach((t) => {
            durs += t.duration
            errs += t.wrongAttempts
        })
        const cnt = this.tasksStats.length
        stats.clear()
        this._showStats(cnt, errs/cnt, durs/cnt/1000)
    }
}

class Task {
    constructor(sheet, noteNotation, clef, onPassed, onFinished) {
        this.sheet = sheet
        this.sheet.resetSheet(clef)
        this.expectedNoteNotation = noteNotation
        this.onPassed = onPassed
        this.onFinished = onFinished
        this.expectedNote = sheet.addNote(this.expectedNoteNotation)[0]
        this.start = Date.now()
        this.duration = null
        this.wrongAttempts = 0
        this.state = 'running'
    }

    handleSolutionAttemptStart(noteNotation) {
        // currently handles only one wrong note at a time
        if(this.state === 'running' && noteNotation.toLowerCase() === this.expectedNoteNotation.toLowerCase()) {
            // correct solution!
            this.duration = Date.now() - this.start
            this.state = 'passed'
            
            this.sheet.updateNoteColor(this.expectedNote, 'green')
            this.onPassed(this)
        } else {
            this.wrongAttempts += 1
            this.wrongInputGroup = this.sheet.addNote(noteNotation, 'red')[1]
        }
    }

    handleSolutionAttemptEnd() {
        if(this.state === 'passed') {
            this.state = 'finished'
            this.onFinished(this)
        } else {
            this.wrongInputGroup.remove()
        }
        
    }
}
