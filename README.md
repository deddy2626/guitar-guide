# Fretwise

A beginner guitar learning app, built for an electric guitar in standard tuning (E A D G B E). Plain HTML/CSS/JS with no build step and no dependencies. Progress is saved in your browser only.

- **Learn**: 11-lesson path from "parts of the guitar" to barre chords, first songs and lead guitar basics, with checklists
- **Chords**: 22 chord diagrams (first chords, power chords, 7ths, barre) you can hear strummed or one string at a time
- **Songs**: a first song ("Creep") with chords, easier shapes, a practice plan and tempo buttons
- **Tuner**: microphone tuner for all six strings, plus reference tones
- **Metro**: metronome with tap tempo and accented first beat
- **Practice**: daily 15-minute routine, timer, minutes log and streak
- **Notes**: fretboard note trainer, E minor pentatonic scale shapes and note map

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

The tuner needs microphone access, which browsers only allow on `localhost` or HTTPS. To use it on your phone, use the GitHub Pages site (HTTPS).

## Publish on GitHub Pages

`.github/workflows/pages.yml` deploys the site on every push to the default branch. One-time setup: in the repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**. The site will then be at `https://<your-username>.github.io/guitar-guide/`.
