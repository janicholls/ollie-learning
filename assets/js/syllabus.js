/* Syllabus structure, numbered exactly as in the exam board specification.
   A topic becomes clickable when live:true and its content file exists in content/<subject>/<id>.js */
(function () {
  'use strict';
  const OL = (window.OL = window.OL || {});
  const T = (id, title, subs, live) => ({ id: id, title: title, live: !!live, subs: subs.map((s, i) => [id + '.' + (i + 1), s]) });

  OL.syllabus = {
    physics: {
      title: 'A-level Physics',
      spec: 'OCR Physics A (H556)',
      modules: [
        { n: 1, title: 'Development of practical skills in physics', papers: 'All papers', topics: [
          T('1.1', 'Practical skills assessed in a written examination', ['Planning', 'Implementing', 'Analysis', 'Evaluation']),
          T('1.2', 'Practical skills assessed in the practical endorsement', ['Practical skills', 'Use of apparatus and techniques'])
        ] },
        { n: 2, title: 'Foundations of physics', papers: 'Papers 01, 02, 03', topics: [
          T('2.1', 'Physical quantities and units', ['Physical quantities', 'S.I. units']),
          T('2.2', 'Making measurements and analysing data', ['Measurements and uncertainties']),
          T('2.3', 'Nature of quantities', ['Scalars and vectors'])
        ] },
        { n: 3, title: 'Forces and motion', papers: 'Papers 01, 03', topics: [
          T('3.1', 'Motion', ['Kinematics', 'Linear motion', 'Projectile motion'], true),
          T('3.2', 'Forces in action', ['Dynamics', 'Motion with non-uniform acceleration', 'Equilibrium', 'Density and pressure']),
          T('3.3', 'Work, energy and power', ['Work and conservation of energy', 'Kinetic and potential energies', 'Power']),
          T('3.4', 'Materials', ['Springs', 'Mechanical properties of matter']),
          T('3.5', "Newton's laws of motion and momentum", ["Newton's laws of motion", 'Collisions'])
        ] },
        { n: 4, title: 'Electrons, waves and photons', papers: 'Papers 02, 03', topics: [
          T('4.1', 'Charge and current', ['Charge', 'Mean drift velocity']),
          T('4.2', 'Energy, power and resistance', ['Circuit symbols', 'E.m.f. and p.d.', 'Resistance', 'Resistivity', 'Power']),
          T('4.3', 'Electrical circuits', ['Series and parallel circuits', 'Internal resistance', 'Potential dividers']),
          T('4.4', 'Waves', ['Wave motion', 'Electromagnetic waves', 'Superposition', 'Stationary waves']),
          T('4.5', 'Quantum physics', ['Photons', 'The photoelectric effect', 'Wave–particle duality'])
        ] },
        { n: 5, title: 'Newtonian world and astrophysics', papers: 'Papers 01, 03', topics: [
          T('5.1', 'Thermal physics', ['Temperature', 'Solid, liquid and gas', 'Thermal properties of materials', 'Ideal gases']),
          T('5.2', 'Circular motion', ['Kinematics of circular motion', 'Centripetal force']),
          T('5.3', 'Oscillations', ['Simple harmonic oscillations', 'Energy of a simple harmonic oscillator', 'Damping']),
          T('5.4', 'Gravitational fields', ['Point and spherical masses', "Newton's law of gravitation", 'Planetary motion', 'Gravitational potential and energy']),
          T('5.5', 'Astrophysics and cosmology', ['Stars', 'Electromagnetic radiation from stars', 'Cosmology'])
        ] },
        { n: 6, title: 'Particles and medical physics', papers: 'Papers 02, 03', topics: [
          T('6.1', 'Capacitors', ['Capacitors', 'Energy', 'Charging and discharging capacitors']),
          T('6.2', 'Electric fields', ['Point and spherical charges', "Coulomb's law", 'Uniform electric field', 'Electric potential and energy']),
          T('6.3', 'Electromagnetism', ['Magnetic fields', 'Motion of charged particles', 'Electromagnetism']),
          T('6.4', 'Nuclear and particle physics', ['The nuclear atom', 'Fundamental particles', 'Radioactivity', 'Nuclear fission and fusion']),
          T('6.5', 'Medical imaging', ['Using X-rays', 'Diagnostic methods in medicine', 'Using ultrasound'])
        ] }
      ]
    }
  };

  OL.findTopic = function (subject, id) {
    const s = OL.syllabus[subject];
    if (!s) return null;
    for (const mod of s.modules) for (const t of mod.topics) if (t.id === id) return { subject: s, module: mod, topic: t };
    return null;
  };
})();
