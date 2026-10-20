'use strict';

// frets / fingers are listed low E -> high e.  fret -1 = don't play, 0 = open.
// fingers: 1 = index, 2 = middle, 3 = ring, 4 = pinky, 0 = none.
const CHORDS = [
  { name: 'Em', full: 'E minor', cat: 'first', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0],
    tip: 'The easiest chord there is. Two fingers, all six strings.' },
  { name: 'Am', full: 'A minor', cat: 'first', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0],
    tip: 'Same shape as E major, moved one string over. Skip the low E string.' },
  { name: 'E', full: 'E major', cat: 'first', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0],
    tip: 'Em plus one finger on the G string. All six strings.' },
  { name: 'A', full: 'A major', cat: 'first', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0],
    tip: 'Three fingers in a row on fret 2. Squeeze them in side by side.' },
  { name: 'D', full: 'D major', cat: 'first', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2],
    tip: 'Only the four thinnest strings. A small triangle shape.' },
  { name: 'Dm', full: 'D minor', cat: 'first', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1],
    tip: 'D with the top finger moved down a fret. Sounds sadder.' },
  { name: 'C', full: 'C major', cat: 'first', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0],
    tip: 'A stretch at first. Skip the low E string. Keep your fingers arched.' },
  { name: 'G', full: 'G major', cat: 'first', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3],
    tip: 'Big and bright. Some people use fingers 2-1-3, others 3-2-4. Use whichever lets you change to C.' },

  { name: 'E5', full: 'E power chord', cat: 'power', frets: [0, 2, 2, -1, -1, -1], fingers: [0, 1, 2, 0, 0, 0],
    tip: 'Play only the three thickest strings. Great with distortion.' },
  { name: 'A5', full: 'A power chord', cat: 'power', frets: [-1, 0, 2, 2, -1, -1], fingers: [0, 0, 1, 2, 0, 0],
    tip: 'Strings 5, 4 and 3 only.' },
  { name: 'D5', full: 'D power chord', cat: 'power', frets: [-1, -1, 0, 2, 3, -1], fingers: [0, 0, 0, 1, 2, 0],
    tip: 'Strings 4, 3 and 2 only.' },
  { name: 'G5', full: 'G power chord', cat: 'power', frets: [3, 5, 5, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0],
    tip: 'Root on the low E string at fret 3. This is the movable shape: slide it anywhere.' },
  { name: 'C5', full: 'C power chord', cat: 'power', frets: [-1, 3, 5, 5, -1, -1], fingers: [0, 1, 3, 4, 0, 0],
    tip: 'Root on the A string at fret 3. The same shape slides up and down the neck.' },
  { name: 'F#5', full: 'F\u266f power chord', cat: 'power', frets: [2, 4, 4, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0],
    tip: 'Root on the low E string at fret 2. The same movable shape as G5, two frets lower.' },

  { name: 'E7', full: 'E dominant 7', cat: 'seventh', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0],
    tip: 'Lift a finger off E and it turns bluesy.' },
  { name: 'A7', full: 'A dominant 7', cat: 'seventh', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0],
    tip: 'Two fingers. Easy and very useful in blues.' },
  { name: 'D7', full: 'D dominant 7', cat: 'seventh', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3],
    tip: 'Like D but the shape is flatter.' },
  { name: 'G7', full: 'G dominant 7', cat: 'seventh', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1],
    tip: 'Like G, but with the pinky replaced by the index on the thin e string.' },
  { name: 'Fmaj7', full: 'F major 7 (easy F)', cat: 'seventh', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0],
    tip: 'A friendly stand-in for the barre F chord while you build strength.' },

  { name: 'B (easy)', full: 'B major, top four strings', cat: 'barre', frets: [-1, -1, 4, 4, 4, 2], fingers: [0, 0, 3, 3, 3, 1],
    tip: 'A mini barre: flatten your ring finger across three strings. Much easier than the full B.' },
  { name: 'Cm (easy)', full: 'C minor, top four strings', cat: 'barre', frets: [-1, -1, 5, 5, 4, 3], fingers: [0, 0, 3, 4, 2, 1],
    tip: 'Only the four thinnest strings. Same notes as the full Cm, with less stretch.' },
  { name: 'B', full: 'B major (barre)', cat: 'barre', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 3, 3, 3, 1],
    tip: 'The open A shape moved up two frets. Index finger bars fret 2 on strings 5 to 1.' },
  { name: 'Cm', full: 'C minor (barre)', cat: 'barre', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1],
    tip: 'The open Am shape moved up three frets. Index finger bars fret 3 on strings 5 to 1.' },
];

const CHORD_CATS = [
  { id: 'first', label: 'First chords' },
  { id: 'power', label: 'Power chords' },
  { id: 'seventh', label: '7ths' },
  { id: 'barre', label: 'Barre' },
];

const LESSONS = [
  {
    id: 1, title: 'Meet your guitar', time: '5 min',
    summary: 'The parts, the strings and the names.',
    body: `
      <p>Your Ibanez GRG131EX is a Gio RG, a solid, comfortable first electric. It's a right-handed guitar, so the left hand frets the notes and the right hand picks.</p>
      <h4>Parts you'll use every day</h4>
      <ul>
        <li><b>Tuning pegs</b> on the headstock tighten or loosen each string.</li>
        <li><b>Nut</b> is where the strings leave the headstock. <b>Frets</b> are the metal bars along the neck.</li>
        <li><b>Pickups</b> are the magnets under the strings that turn vibration into signal. The <b>selector switch</b> chooses which pickup you hear. Neck is warmer, bridge is brighter.</li>
        <li><b>Volume and tone knobs</b> are on the body. <b>Output jack</b> is where the cable goes.</li>
      </ul>
      <h4>The six strings</h4>
      <p>Number them from the <b>thinnest (1st)</b> to the <b>thickest (6th)</b>. In standard tuning, thick to thin, they are:</p>
      <p class="big-line">E &nbsp; A &nbsp; D &nbsp; G &nbsp; B &nbsp; E</p>
      <p class="hint">Mnemonic: <i>Eddie Ate Dynamite, Good Bye Eddie.</i></p>
      <h4>Making noise</h4>
      <p>An electric is very quiet without an amp. You need one of: a small practice amp, a headphone amp, or an audio interface with a free amp simulator on your computer. Start with the <b>clean</b> channel at a low volume. Distortion makes mistakes sound cool, but it hides them from you.</p>`,
    checklist: ['I can point to the headstock, nut, frets, pickups and bridge', 'I know the string names low to high: E A D G B E', 'My amp or headphones are set up with a clean sound'],
  },
  {
    id: 2, title: 'Tune up', time: '5 min',
    summary: 'A guitar out of tune sounds wrong however well you play.',
    body: `
      <p>Open the <a href="#tuner">Tuner</a> tab. Tune the strings in order, from the thickest (low E) to the thinnest.</p>
      <ol>
        <li>Pluck <b>one</b> string firmly and let it ring.</li>
        <li>If it's flat, tighten the peg a little. If it's sharp, loosen below the note and then come back up to it.</li>
        <li>Move to the next string. When all six are done, go around once more, since tightening one string can nudge the others.</li>
      </ol>
      <p class="hint">Turn the peg slowly. The strings are very tight. If a string snaps it happens to everyone, and a set costs only a few dollars.</p>`,
    checklist: ['I tuned all six strings with the tuner', 'I went around a second time to double-check'],
  },
  {
    id: 3, title: 'Posture, pick & hands', time: '8 min',
    summary: 'Get comfortable now and you avoid bad habits and sore wrists later.',
    body: `
      <h4>Sitting</h4>
      <p>Sit upright on a chair without arms. Rest the guitar body on your right leg, with the neck angled slightly upward. Don't hunch over it.</p>
      <h4>Fretting hand (left)</h4>
      <ul>
        <li>Thumb rests <b>behind</b> the neck, roughly opposite your middle finger.</li>
        <li>Press with your <b>fingertips</b>, close to the fret, just behind the metal bar, not on top of it.</li>
        <li>Keep your fingers arched like you're holding a small ball so they don't touch the neighbouring strings.</li>
        <li>You need <b>less pressure</b> than you'd think: just enough that it doesn't buzz.</li>
      </ul>
      <h4>Picking hand (right)</h4>
      <ul>
        <li>Hold the pick between your thumb and the side of your index finger with just the tip poking out.</li>
        <li>Rest the heel of your hand lightly near the bridge. Move from the wrist, not the whole arm.</li>
      </ul>
      <h4>Warm-up: 1-2-3-4</h4>
      <p>On the 6th string, play fret 1, 2, 3, 4, one finger per fret (index, middle, ring, pinky). Move to the 5th string and repeat, and so on up to the 1st. Go slowly with the <a href="#metronome">metronome</a>.</p>
      <p class="hint">Sore fingertips are normal for the first 2–3 weeks while calluses form. Short sessions (10–15 min), repeated often, are better than one long one.</p>`,
    checklist: ['I can hold the pick comfortably', 'My thumb sits behind the neck and I press with fingertips', 'I played the 1-2-3-4 exercise on all six strings'],
  },
  {
    id: 4, title: 'Reading chord diagrams & tabs', time: '5 min',
    summary: 'The two pictures you will use for everything.',
    body: `
      <h4>Chord diagrams</h4>
      <ul>
        <li>The <b>vertical lines</b> are strings. The thickest low E is on the <b>left</b>.</li>
        <li>The <b>horizontal lines</b> are frets. The thick top line is the nut.</li>
        <li>A <b>dot</b> is where a finger goes, and the number inside is the finger: 1 = index, 2 = middle, 3 = ring, 4 = pinky.</li>
        <li><b>○</b> above a string means play it open. <b>×</b> means don't play that string.</li>
      </ul>
      <h4>Tablature (tab)</h4>
      <p>Tab has six lines, one per string, with the <b>thinnest string on top</b>. A number tells you which fret to play. <code>0</code> means open.</p>
<pre class="tab">e|-----0-----|
B|---1-------|
G|-2---------|
D|-----------|
A|-----------|
E|-----------|</pre>
      <p class="hint">Read left to right. This tab means: G string fret 2, B string fret 1, then the open e string.</p>
      <h4>Symbols you'll see in tabs</h4>
      <ul>
        <li><code>/</code> slide up &nbsp;·&nbsp; <code>&#92;</code> slide down</li>
        <li><code>h</code> hammer-on: <code>5h7</code> is fret 5, then hammer a finger onto fret 7</li>
        <li><code>p</code> pull-off: <code>7p5</code> is fret 7, then pull off to fret 5</li>
        <li><code>b</code> bend: <code>16b18</code> is fret 16 bent up until it sounds like fret 18</li>
        <li><code>r</code> release: let a bent string back down</li>
        <li><code>x</code> muted note: a dead, percussive sound</li>
        <li><code>~</code> vibrato</li>
      </ul>
      <p class="hint">Lesson 11 shows how to play these.</p>`,
    checklist: ['I can read which string and fret a dot means', 'I know × and ○ on a diagram', 'I can read a simple tab', 'I know what / \\ h p b r x ~ mean in a tab'],
  },
  {
    id: 5, title: 'Your first chords', time: '15 min',
    summary: 'Em and Am first, then E, A and D.',
    body: `
      <p>Open the <a href="#chords">Chords</a> tab. Start with <a class="chip" href="#chords/Em">Em</a> and <a class="chip" href="#chords/Am">Am</a>. They're the easiest shapes and between them you can play real music.</p>
      <h4>The one-string-at-a-time check</h4>
      <ol>
        <li>Make the shape.</li>
        <li>Pick each string one at a time, slowly.</li>
        <li>If a note is buzzing or dead, find out why: a finger too far from the fret? A finger touching a neighbour string? Pressing too lightly?</li>
        <li>Adjust it, then re-check. Each chord should ring out cleanly before you move on.</li>
      </ol>
      <p>Once Em and Am feel okay, add <a class="chip" href="#chords/E">E</a>, <a class="chip" href="#chords/A">A</a> and <a class="chip" href="#chords/D">D</a>. After that, <a class="chip" href="#chords/G">G</a> and <a class="chip" href="#chords/C">C</a>.</p>
      <p class="hint">It's normal for chords to sound bad for the first week or two. Your fingers are learning a new job.</p>`,
    chords: ['Em', 'Am', 'E', 'A', 'D'],
    checklist: ['Em rings clearly on every string', 'Am rings clearly on every string', 'E, A and D each ring clearly'],
  },
  {
    id: 6, title: 'Strumming & rhythm', time: '10 min',
    summary: 'Timing matters more than which chord you play.',
    body: `
      <p>Strumming is the right hand's job, and it's the difference between sounding like a song and sounding like an exercise.</p>
      <h4>Step 1: downstrokes</h4>
      <p>Set the <a href="#metronome">metronome</a> to about 60 BPM. Mute the strings by lightly touching them with your fretting hand, or just play Em. Count <b>1, 2, 3, 4</b> and play a <b>down</b> strum on every number.</p>
      <h4>Step 2: add the ups</h4>
      <p>Count <b>1 &amp; 2 &amp; 3 &amp; 4 &amp;</b>. Your hand moves down on the number and up on the "&amp;", and it <b>never stops moving</b>, even when you don't hit the strings.</p>
      <h4>Step 3: a first pattern</h4>
<pre class="tab">count:  1  2  &amp;  &amp;  4  &amp;
strum:  D  D  U     U  D  U</pre>
      <p class="hint">Don't hit all six strings every time. Aim for the thicker strings on downs and let the up strums catch only the top few. Keep the wrist loose.</p>`,
    checklist: ['I can play steady downstrokes in time at 60 BPM', 'I can keep my hand moving down-up while counting', 'I can play the D D U U D U pattern on one chord'],
  },
  {
    id: 7, title: 'Changing chords', time: '15 min',
    summary: 'The skill that separates "I know chords" from "I can play songs".',
    body: `
      <h4>The one-minute drill</h4>
      <p>Pick two chords, e.g. <a class="chip" href="#chords/Em">Em</a> ↔ <a class="chip" href="#chords/Am">Am</a>. Set a timer for 60 seconds. Switch back and forth, strumming once after each change, and count the <b>clean</b> changes. Write your number down. Next day, try to beat it.</p>
      <h4>Tips</h4>
      <ul>
        <li>Move all your fingers at once as a single shape rather than one at a time.</li>
        <li>Look at where your fingers are going, not where they are.</li>
        <li>Go slowly. Speed comes from smoothness, not from rushing.</li>
        <li>Keep strumming in time even if you miss the chord. The beat never stops.</li>
      </ul>
      <h4>Pairs to practice</h4>
      <p>Em ↔ Am · A ↔ D · E ↔ A · G ↔ C · C ↔ D</p>
      <h4>Your first progression</h4>
      <p class="big-line">Em · C · G · D</p>
      <p class="hint">Play each chord for four beats at 60 BPM. That one loop is the backbone of hundreds of songs.</p>`,
    chords: ['Em', 'C', 'G', 'D'],
    checklist: ['Em ↔ Am: 20+ clean changes in a minute', 'A ↔ D: 15+ clean changes in a minute', 'I played Em – C – G – D in time at 60 BPM'],
  },
  {
    id: 8, title: 'Power chords & palm muting', time: '15 min',
    summary: 'The sound of rock. Easier than open chords on electric.',
    body: `
      <p>A power chord is two or three notes only: easy to play and loud and punchy with a little gain. Try <a class="chip" href="#chords/E5">E5</a>, <a class="chip" href="#chords/A5">A5</a> and <a class="chip" href="#chords/D5">D5</a> first.</p>
      <h4>The movable shape</h4>
      <p>Put your <b>index finger</b> on the 6th string. Add your <b>ring finger</b> two frets higher on the 5th string and your <b>pinky</b> two frets higher on the 4th. Strum only those three strings. Slide the same shape to any fret and you have a new chord: the root note is wherever your index finger is. See <a class="chip" href="#chords/G5">G5</a> and <a class="chip" href="#chords/C5">C5</a>.</p>
      <h4>Palm muting</h4>
      <p>Rest the edge of your picking-hand palm lightly on the strings right next to the bridge, then pick. The notes become short and chunky. It's the foundation of rock and metal rhythm.</p>
      <h4>Quiet the other strings</h4>
      <p>The thick-string fingers can lightly touch the unused strings, and your picking hand can mute the rest. With distortion on, unwanted string noise is amplified a lot.</p>`,
    chords: ['E5', 'A5', 'D5', 'G5'],
    checklist: ['I can play E5, A5 and D5 cleanly', 'I can slide the power chord shape up the neck', 'I tried palm muting'],
  },
  {
    id: 9, title: 'Your first barre chords', time: '15 min',
    summary: 'One finger acts as a movable nut. Hard at first, and that\'s normal.',
    body: `
      <p>A barre chord uses one finger, usually the index, pressed flat across several strings, so your other fingers can make a chord shape. Slide the whole shape up the neck and you get a different chord. Expect buzzing and a tired hand for a few weeks. Nearly everyone goes through this.</p>
      <h4>Start with the mini versions</h4>
      <p>Before the full six-string barre, play only the top four strings: <a class="chip" href="#chords/B%20(easy)">B (easy)</a> and <a class="chip" href="#chords/Cm%20(easy)">Cm (easy)</a>. They sound very close to the real thing and cost far less effort.</p>
      <h4>Build the full barre</h4>
      <ol>
        <li>Lay your index finger flat across the strings, just behind the fret. For <a class="chip" href="#chords/B">B</a> that's fret 2, strings 5 to 1.</li>
        <li>Roll the finger slightly onto its bony edge (toward the thumb side) so the soft pad doesn't mute strings.</li>
        <li>Add the other fingers on top. The B chord is the open A shape moved up two frets, and <a class="chip" href="#chords/Cm">Cm</a> is the open Am shape moved up three frets.</li>
        <li>Keep your thumb low behind the neck and pull gently with your arm. Don't just squeeze with your thumb.</li>
      </ol>
      <p>Pick each string one at a time. If one is buzzing, move the barre finger closer to the fret, or shift it so a gap in your finger (the creases) isn't over a string.</p>
      <p class="hint">Short sessions, and rest when your hand tires. Stop if you feel pain in your wrist. A barre can take weeks to come good, and that's normal.</p>`,
    chords: ['B (easy)', 'Cm (easy)', 'B', 'Cm'],
    checklist: ['I can play B (easy) and Cm (easy) with all four strings ringing', 'I can hold the full B barre with at least four clear notes', 'I can change between G and B (easy) in time'],
  },
  {
    id: 10, title: 'Play your first songs', time: 'ongoing',
    summary: 'This is why you picked up a guitar.',
    body: `
      <p>Open the <a href="#songs">Songs</a> tab for a first song with a practice plan. For others, search for "<i>song name</i> easy chords" or "<i>song name</i> guitar tab". Pick songs using <b>3–4 chords you already know</b>. Learn one section at a time (verse, then chorus) and play along slowly with the metronome.</p>
      <h4>Easy riffs to try</h4>
      <p>Single-note riffs are a great way to build finger independence. The Seven Nation Army riff, for instance, can be played on one string.</p>
      <h4>When you're stuck</h4>
      <ul>
        <li>Slow it down. Cut the tempo in half.</li>
        <li>Isolate the hard part: loop two or three beats, not the whole song.</li>
        <li>Take a break. Skills consolidate when you rest.</li>
        <li>Record yourself. It's the quickest way to hear what you can't while playing.</li>
      </ul>`,
    checklist: ['I picked a song with 3–4 chords', 'I can play the verse in time at a slow tempo', 'I played along with the original track'],
  },
  {
    id: 11, title: 'Lead guitar basics', time: '20 min',
    summary: 'Single notes, the pentatonic scale and the techniques behind most leads.',
    body: `
      <p>Rhythm guitar plays chords. <b>Lead</b> guitar plays single notes: melodies, licks and solos. To play a song's lead lines you need clean single notes, a few techniques and a map of where the notes are.</p>
      <h4>1. Clean single notes</h4>
      <ul>
        <li>Press with an arched fingertip just behind the fret so only the string you want rings.</li>
        <li>Use <b>alternate picking</b>: down, up, down, up, with the movement coming from your wrist.</li>
        <li>Start with the <a href="#metronome">metronome</a> at 60 BPM, one note per click.</li>
      </ul>
      <h4>2. A scale shape to call home</h4>
      <p>Open the <a href="#fretboard">Notes</a> tab and find <b>Scale shapes</b>. Start with the <b>E minor pentatonic</b>, open position (frets 0–3). Play it up and down, naming each note out loud. The loop in <a href="#songs/creep">Creep</a> is in G major, and E minor pentatonic (E G A B D) is the matching "home" scale for leads over it.</p>
      <h4>3. Core techniques</h4>
      <ul>
        <li><b>Hammer-on:</b> pick a fretted note, then slam another finger down on a higher fret of the same string, without picking again.</li>
        <li><b>Pull-off:</b> the reverse. Pluck the string sideways as you lift off, leaving the lower note ringing.</li>
        <li><b>Slide:</b> keep the pressure on and glide to another fret.</li>
        <li><b>Bend:</b> push the string up toward the ceiling with your ring finger, supported by the fingers behind it. A <i>whole-step</i> bend should sound like the note 2 frets higher. Check this by playing that fret first.</li>
        <li><b>Vibrato:</b> a small, steady shake of a held note.</li>
        <li><b>Palm muting</b> and short, choppy muted strums are used a lot for the harder, noisier parts of rock songs.</li>
      </ul>
      <h4>4. Learning a lead from a tab</h4>
      <ol>
        <li>Find a verified tab. A site or app that lets you slow the playback down and loop a bar, like Songsterr, is ideal.</li>
        <li>Learn <b>one or two bars</b> at a time, at about half speed. Say the fret numbers out loud first.</li>
        <li>Loop the bars. Only speed up after five clean repeats in a row.</li>
        <li>Listen to the original recording a lot. Bends, vibrato and dynamics are rarely written in a tab, and they are most of the feel.</li>
      </ol>
      <p class="hint">Leads usually sound better with some gain and your bridge pickup. Keep the volume low enough to hear your own mistakes.</p>`,
    checklist: ['I can play the E minor pentatonic, open position, up and down at 60 BPM', 'I can play a clean hammer-on and a clean pull-off', 'I tried a whole-step bend and matched the pitch of the note 2 frets higher', 'I learned one bar of a lead from a tab at slow speed'],
  },
];

const ROUTINE = [
  { id: 'tune', label: 'Tune up', min: 1, hint: 'Use the Tuner tab.' },
  { id: 'warm', label: 'Warm up', min: 3, hint: '1-2-3-4 finger exercise on every string.' },
  { id: 'chords', label: 'Chord changes', min: 5, hint: 'One-minute drill on a pair of chords.' },
  { id: 'strum', label: 'Strumming with the metronome', min: 3, hint: 'A pattern on one chord at 60–80 BPM.' },
  { id: 'fun', label: 'Play something fun', min: 3, hint: 'A riff or song, just for enjoyment.' },
];

const SONGS = [
  {
    id: 'creep', title: 'Creep', artist: 'Radiohead', album: 'Pablo Honey',
    level: 'Beginner+ · needs barre chords',
    startBpm: 60, targetBpm: 92,
    chords: ['G', 'B', 'C', 'Cm'],
    easy: ['G', 'B (easy)', 'C', 'Cm (easy)'],
    lessons: [5, 7, 9],
    summary: 'Four chords, a famous rhythm, and a quiet-to-loud shape that is great practice.',
    body: `
      <p>"Creep" is built on a loop of four chords: <b>G, B, C, Cm</b>. G and C are open chords you may already know. B and Cm are barre chords, so do <a href="#learn/9">lesson 9</a> first. The mini <b>B (easy)</b> and <b>Cm (easy)</b> shapes are a perfectly good way to start.</p>
      <p class="hint">This page covers the chords and a practice plan only. For the exact strumming, the lead lines and the lyrics, find a verified tab and play along with the recording.</p>
      <h4>The loop</h4>
      <p class="big-line">G · B · C · Cm</p>
      <p>To practise it, give each chord one bar (4 beats) and play it over and over.</p>
      <h4>Practice plan</h4>
      <ol>
        <li><b>Each chord alone.</b> Make the shape, then pick the strings one at a time and fix any buzz.</li>
        <li><b>Change drills.</b> Do the <a href="#learn/7">one-minute drill</a> on G ↔ B, B ↔ C and C ↔ Cm. The C ↔ Cm change is a small move. Keep the shape and shift your fingers together.</li>
        <li><b>The loop at a slow tempo.</b> Set the metronome to 60 BPM and play one downstroke per beat, four per chord. Don't speed up until you can do it without stopping.</li>
        <li><b>Raise the tempo</b> in steps of 5 BPM towards about 90.</li>
        <li><b>Play along with the recording,</b> first with the easy shapes, then the full barres.</li>
        <li><b>Add dynamics.</b> The song goes from quiet to loud. Play it softly on a clean amp sound, then dig in harder (or add some gain) for the big sections.</li>
      </ol>`,
    lead: `
      <h4>Learning the lead parts</h4>
      <p>I haven't written out the note-by-note lead tab here. Find a verified tab (Songsterr, for example, can slow it down and loop a bar) and learn it in short pieces. Get these skills ready first:</p>
      <ul>
        <li><b>Clean single notes</b> with alternate picking, in time with the metronome.</li>
        <li><b>Hammer-ons, pull-offs, slides and bends.</b> See <a href="#learn/11">lesson 11</a>.</li>
        <li><b>The E minor pentatonic shape.</b> The loop is in G major, so this is the home scale to know. Find it in the <a href="#fretboard">Notes</a> tab under Scale shapes.</li>
        <li><b>The loud, choppy hits</b> that come in before the big sections. Listen for them on the recording. They're a rhythm technique: strum hard, then immediately relax your fretting hand to deaden the strings.</li>
      </ul>
      <p>Then work through the tab one or two bars at a time, at about 50% speed. Listen to the record for the bends, vibrato and dynamics that tabs leave out.</p>`,
    checklist: ['I can play G and C cleanly', 'I can play B (easy) or the full B barre', 'I can play Cm (easy) or the full Cm barre', 'I can play the whole loop at 60 BPM without stopping', 'I can play the loop at around 90 BPM', 'I played along with the recording', 'I can play the E minor pentatonic open position cleanly at 60 BPM', 'I learned one bar of the lead from a verified tab at slow speed'],
  },
  {
    id: 'fake-plastic-trees', title: 'Fake Plastic Trees', artist: 'Radiohead', album: 'The Bends',
    level: 'Intermediate · power chords, bends and vibrato',
    startBpm: 50, targetBpm: 73, tempoNote: '(estimate)',
    chords: ['A5', 'F#5', 'E5'],
    easy: [],
    lessons: [8, 11],
    summary: 'A slow, big-feeling song. The version in your tutorial uses power chords, an octave climb and high bends.',
    body: `
      <p><b>Heads up:</b> the chords published for this song disagree. Some charts are in D major, others are built around A with D and Bm, and sites give the same sounds different names. So treat this page as a practice guide for the <b>power-chord version in the tutorial video you're following</b>, not as the definitive chart. Check it against the recording by ear.</p>
      <h4>The shapes in the video</h4>
      <ul>
        <li><a class="chip" href="#chords/A5">A5</a>: A string open, D string fret 2, G string fret 2.</li>
        <li><a class="chip" href="#chords/F%235">F♯5</a>: E string fret 2, A string fret 4, D string fret 4. It's the same movable shape as G5.</li>
        <li><b>E5</b>: the movable power chord with its root on the A string at fret 7 (A string fret 7, D string fret 9). That is higher than the open <a class="chip" href="#chords/E5">E5</a> in the Chords tab, which "Hear the loop" uses.</li>
      </ul>
      <p>These match simpler charts that list A, F♯m and E.</p>
      <h4>Tempo and strumming</h4>
      <p>The song is in 4/4 and slow. Crowd-sourced figures put the recording at roughly 70–75 BPM, so check it yourself against the track. The video's strumming is <b>D D U U D U</b> from <a href="#learn/6">lesson 6</a>.</p>
      <h4>Practice plan</h4>
      <ol>
        <li><b>Each shape alone.</b> Pick the strings one at a time and fix any buzz. Mute the strings you aren't playing.</li>
        <li><b>Change drills.</b> A5 ↔ F♯5, F♯5 ↔ E5 and E5 ↔ A5 with the <a href="#learn/7">one-minute drill</a>. The F♯5 shape slides like in <a href="#learn/8">lesson 8</a>.</li>
        <li><b>Strum D D U U D U</b> on each chord at 50 BPM, one bar per chord.</li>
        <li><b>Raise the tempo</b> in steps of 5 BPM towards the recording.</li>
        <li><b>Play along</b> with the recording once it feels easy.</li>
      </ol>`,
    lead: `
      <h4>The lead techniques in the tutorial</h4>
      <p>I haven't written out the tab. Learn it from the video's own tab, one or two bars at a time, with the video at half speed. These are the skills it asks for:</p>
      <ul>
        <li><b>Whole-step bends.</b> <code>16b18</code> means fret 16, bent until it sounds like fret 18. Play fret 18 first so you know the target, then bend fret 16 to match.</li>
        <li><b>Vibrato</b> (<code>~</code>) on held notes.</li>
        <li><b>The octave shape with a muted middle string.</b> The <code>x</code> marks are the muted string. Your index finger frets the lower note and lightly touches the string above it, and your ring finger takes the note two frets higher on the next string.</li>
        <li><b>High positions,</b> around frets 14–19. Count the frets on your guitar to check you can reach them.</li>
      </ul>
      <p>See <a href="#learn/4">lesson 4</a> for the tab symbols and <a href="#learn/11">lesson 11</a> for the techniques.</p>`,
    checklist: ['I can play A5, F♯5 and E5 cleanly', 'I can change between them in time at 50 BPM', 'I can play D D U U D U on a power chord at 50 BPM', 'I can play the loop at around 70 BPM', 'I can play the octave shape with the middle string muted', 'I can play a clean whole-step bend (fret 16 to the pitch of fret 18)', 'I learned one bar of the lead at half speed'],
  },
];

// Scale shown in the Notes tab. Positions are fret windows; the notes inside are worked out from the pitch classes.
const SCALE = {
  name: 'E minor pentatonic', root: 4, pcs: [4, 7, 9, 11, 2],
  positions: [
    { label: 'Open (0–3)', range: [0, 3] },
    { label: 'Frets 2–5', range: [2, 5] },
    { label: 'Frets 4–8', range: [4, 8] },
    { label: 'Frets 7–10', range: [7, 10] },
    { label: 'Frets 9–12', range: [9, 12] },
    { label: 'All', range: [0, 12] },
  ],
};
