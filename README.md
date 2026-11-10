# ollie-learning

A-level consolidation site for Ollie. For every topic in the specification there is a **Key concepts** page with interactive visualisations and a **Quiz**. Physics (OCR Physics A, H556) comes first; Maths and Design Engineering will reuse the same shell.

Live topics so far: **3.1 Motion**.

## How it works

- Plain HTML, CSS and JavaScript. No build step and no dependencies, so GitHub Pages serves the repo as it is.
- It also works when `index.html` is opened straight from a folder, which is handy for previewing a change before it goes live.
- Progress (concepts read, best quiz score) is saved in the browser on that device only.

```
index.html                 syllabus home page
topic.html                 topic page (topic.html?t=3.1)
assets/css/site.css        styles
assets/js/core.js          helpers, maths markup, saved progress
assets/js/syllabus.js      specification structure and which topics are live
assets/js/viz.js           visualisation kit (canvas, sliders, play bar, graphs, cars)
assets/js/home.js          home page
assets/js/topic.js         key concepts and quiz engine
content/physics/3.1.js     concepts and questions for 3.1 Motion
content/physics/3.1.viz.js visualisations for 3.1 Motion
tools/check.mjs            content checker
archive/                   the original stand-alone Motion quiz
```

## Adding a topic

1. Write `content/<subject>/<id>.js` (and `<id>.viz.js` if it has visualisations), following `content/physics/3.1.js`.
2. Tag every concept block and question with the specification statements it covers (`refs`).
3. Set `live` to `true` for the topic in `assets/js/syllabus.js`.
4. Run the checker.

## Checking the content

```
node tools/check.mjs
```

This confirms that every specification statement in a live topic has a concept block and a question, that each calculation question gives the same answer by a second independent method across 400 random sets of numbers, and that every number quoted in a worked example or mark scheme matches a fresh calculation.

## Question types

- **Multiple choice** and **calculation** questions are marked automatically. Calculation questions use new numbers on every attempt and accept answers within 1% of the exact value.
- **Exam-style** questions are written answers that the student marks against a mark scheme.
