# Fretwise

A beginner guitar learning app, built for an electric guitar in standard tuning (E A D G B E). Plain HTML/CSS/JS with no build step and no dependencies. Progress is saved in your browser only.

- **Learn**: 9-lesson path from "parts of the guitar" to first songs, with checklists
- **Chords**: 18 chord diagrams (first chords, power chords, 7ths) you can hear strummed or one string at a time
- **Tuner**: microphone tuner for all six strings, plus reference tones
- **Metro**: metronome with tap tempo and accented first beat
- **Practice**: daily 15-minute routine, timer, minutes log and streak
- **Notes**: fretboard note trainer and note map

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

The tuner needs microphone access, which browsers only allow on `localhost` or HTTPS. To use it on your phone, host the folder on any static host (e.g. GitHub Pages).
