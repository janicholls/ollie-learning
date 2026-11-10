/* OCR Physics A (H556) – 3.1 Motion: key concepts and quiz.
   Every block and question is tagged with the specification statements it covers (refs).
   tools/check.mjs checks the tags, the coverage and every number on this page. */
(function () {
  'use strict';
  const OL = window.OL, m = OL.m, sf = OL.sf, G = OL.G;
  const MS = ' m s⁻¹', MS2 = ' m s⁻²';

  const lightGates =
    '<svg viewBox="0 -18 520 188" role="img" aria-label="A trolley with a card on top rolls down a ramp through two light gates connected to a data-logger" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="12">' +
    '<path d="M20 60 L500 140 L20 140 Z" fill="#1f2b45" stroke="#3a4a6b"/>' +
    '<g transform="translate(92 64) rotate(9.5)"><rect x="0" y="-18" width="64" height="16" rx="3" fill="#67e8f9"/><rect x="22" y="-42" width="20" height="24" fill="#fbbf24"/><circle cx="12" cy="0" r="7" fill="#0a0d14"/><circle cx="52" cy="0" r="7" fill="#0a0d14"/></g>' +
    '<g stroke="#8a9bb8" stroke-width="3" fill="none"><path d="M250 40 v58"/><path d="M400 64 v58"/></g>' +
    '<g fill="#fb7185"><rect x="243" y="32" width="14" height="10" rx="2"/><rect x="393" y="56" width="14" height="10" rx="2"/></g>' +
    '<g fill="#c6d4ea"><text x="250" y="24" text-anchor="middle">light gate 1</text><text x="400" y="48" text-anchor="middle">light gate 2</text>' +
    '<text x="20" y="-2" fill="#fbbf24">card of known length</text><text x="325" y="160" text-anchor="middle">both gates connect to a timer or data-logger</text></g></svg>';

  OL.registerTopic('physics/3.1', {
    statements: {
      '3.1.1a': 'displacement, instantaneous speed, average speed, velocity and acceleration',
      '3.1.1b': 'graphical representations of displacement, speed, velocity and acceleration',
      '3.1.1c': 'displacement–time graphs; velocity is gradient',
      '3.1.1d': 'velocity–time graphs; acceleration is gradient; displacement is area under graph (including estimating the area under non-linear graphs)',
      '3.1.2a(i)': 'the equations of motion for constant acceleration in a straight line, including motion of bodies falling in a uniform gravitational field without air resistance',
      '3.1.2a(ii)': 'techniques and procedures used to investigate the motion and collisions of objects (PAG1: trolleys, air-track gliders, ticker timers, light gates, data-loggers and video techniques)',
      '3.1.2b(i)': 'acceleration g of free fall',
      '3.1.2b(ii)': 'techniques and procedures used to determine the acceleration of free fall using a trapdoor and electromagnet arrangement or light gates and timer',
      '3.1.2c': 'reaction time and thinking distance; braking distance and stopping distance for a vehicle',
      '3.1.3a': 'independence of the vertical and horizontal motion of a projectile',
      '3.1.3b': 'two-dimensional motion of a projectile with constant velocity in one direction and constant acceleration in a perpendicular direction'
    },

    sections: [
      { id: '3.1.1', title: 'Kinematics', blocks: [
        { id: 'language', title: 'The language of motion', refs: ['3.1.1a'], viz: 'lap',
          html:
            '<ul>' +
            '<li><b>Distance</b> is how far something has travelled. It is a scalar. <b>Displacement</b> ' + m('s') + ' is the distance from the starting point in a stated direction. It is a vector.</li>' +
            '<li><b>Speed</b> is the rate of change of distance. <b>Velocity</b> ' + m('v') + ' is the rate of change of displacement, so it has a direction.</li>' +
            '<li><b>Average speed</b> is total distance divided by total time. <b>Instantaneous speed</b> is the speed at one moment, which is what a speed trace on the pit wall shows.</li>' +
            '<li><b>Acceleration</b> ' + m('a') + ' is the rate of change of velocity. It is a vector, and slowing down is a negative acceleration.</li>' +
            '</ul>' +
            '<div class="eqn">' + m('v = Δs / Δt') + m('a = Δv / Δt') + '<small>velocity in m s⁻¹, acceleration in m s⁻²</small></div>',
          example: '<p>A car completes a 5.80 km lap in 90.0 s.</p>' +
            '<p>Average speed = 5800 ÷ 90.0 = <b>64.4 m s⁻¹</b>. It finishes where it started, so its displacement is zero and its average velocity is <b>0 m s⁻¹</b>.</p>' +
            '<p>Off the grid it goes from rest to 28.0 m s⁻¹ in 2.50 s: ' + m('a = Δv / Δt') + ' = 28.0 ÷ 2.50 = <b>11.2 m s⁻²</b>.</p>',
          traps: ['Average velocity uses displacement, not distance. Over a complete lap it is zero.', 'A car going round a corner at a steady speed is still accelerating, because the direction of its velocity is changing.'] },

        { id: 'graphs', title: 'Graphs of motion', refs: ['3.1.1b', '3.1.1c', '3.1.1d'], viz: 'graphs',
          html:
            '<div class="table-scroll"><table class="cmp"><thead><tr><th>Graph</th><th>Gradient gives</th><th>Area under the line gives</th></tr></thead><tbody>' +
            '<tr><td>Displacement–time</td><td><b>velocity</b></td><td>nothing useful</td></tr>' +
            '<tr><td>Velocity–time</td><td><b>acceleration</b></td><td><b>displacement</b></td></tr></tbody></table></div>' +
            '<ul>' +
            '<li>A straight line on a displacement–time graph means constant velocity. A curve means the velocity is changing: draw a <b>tangent</b> and find its gradient to get the velocity at that instant.</li>' +
            '<li>A straight line on a velocity–time graph means constant acceleration. A horizontal line means constant velocity.</li>' +
            '<li>Area below the time axis counts as negative displacement, because the object is moving backwards.</li>' +
            '<li>If the velocity–time graph is curved, <b>estimate</b> the area by counting squares or by splitting it into trapezia.</li>' +
            '<li>Data-loggers produce these graphs directly, which is exactly what car telemetry is.</li>' +
            '</ul>',
          example: '<p>A velocity–time graph rises in a straight line from 20 m s⁻¹ to 80 m s⁻¹ over 5.0 s, then stays at 80 m s⁻¹ for 3.0 s.</p>' +
            '<p>Acceleration = gradient = (80 − 20) ÷ 5.0 = <b>12 m s⁻²</b>.</p>' +
            '<p>Displacement = area = ½(20 + 80) × 5.0 + 80 × 3.0 = 250 + 240 = <b>490 m</b>.</p>',
          traps: ['For the gradient of a curve, draw the tangent as a long line and use a big triangle. A tiny triangle gives a poor answer.', 'Displacement comes from the area under a velocity–time graph, never from a displacement–time graph.'] }
      ] },

      { id: '3.1.2', title: 'Linear motion', blocks: [
        { id: 'suvat', title: 'The equations of motion (suvat)', refs: ['3.1.2a(i)'], viz: 'braking',
          html:
            '<p>For motion in a straight line with <b>constant acceleration</b>, five quantities are linked: displacement ' + m('s') + ', initial velocity ' + m('u') + ', final velocity ' + m('v') + ', acceleration ' + m('a') + ' and time ' + m('t') + '.</p>' +
            '<div class="eqn">' + m('v = u + at') + m('s = ½(u + v)t') + m('s = ut + ½at^2') + m('v^2 = u^2 + 2as') + '</div>' +
            '<ul>' +
            '<li>Write down <b>s, u, v, a, t</b> and fill in the three you know.</li>' +
            '<li>Choose a positive direction and give every vector a sign.</li>' +
            '<li>Pick the equation that contains your three known values and the one you want.</li>' +
            '<li>For an object falling with no air resistance, ' + m('a = g') + ' = 9.81 m s⁻² downwards.</li>' +
            '</ul>',
          example: '<p>A car arrives at a corner at 90 m s⁻¹ and must slow to 25 m s⁻¹. Its brakes give a deceleration of 45 m s⁻².</p>' +
            '<p>' + m('u') + ' = 90, ' + m('v') + ' = 25, ' + m('a') + ' = −45, ' + m('s') + ' = ? &nbsp; There is no time, so use ' + m('v^2 = u^2 + 2as') + '.</p>' +
            '<p>' + m('s = (v^2 - u^2) / 2a') + ' = (25² − 90²) ÷ (2 × −45) = <b>83.1 m</b>. &nbsp; Then ' + m('t = (v - u) / a') + ' = (25 − 90) ÷ −45 = <b>1.44 s</b>.</p>',
          traps: ['A deceleration goes into the equations as a negative acceleration.', 'Speeds must be in m s⁻¹. To convert from km/h, divide by 3.6.', 'The equations only work while the acceleration is constant. If it changes, split the motion into stages.'] },

        { id: 'pag1', title: 'Investigating motion in the lab (PAG 1)', refs: ['3.1.2a(ii)'],
          html:
            '<div class="table-scroll"><table class="cmp"><thead><tr><th>Technique</th><th>How it gives the motion</th></tr></thead><tbody>' +
            '<tr><td><b>Light gates</b> and a timer or data-logger</td><td>A card of known length on the trolley blocks the beam. Velocity = card length ÷ time the beam is blocked. Two gates give two velocities, and so an acceleration.</td></tr>' +
            '<tr><td><b>Ticker timer</b></td><td>Makes 50 dots a second on a tape pulled by the object. The spacing of the dots shows the speed.</td></tr>' +
            '<tr><td><b>Motion sensor</b> and data-logger</td><td>Measures displacement many times a second and plots the graphs for you.</td></tr>' +
            '<tr><td><b>Video</b></td><td>Step through frame by frame against a scale in the picture. The frame rate gives the time between positions.</td></tr>' +
            '<tr><td><b>Trolleys and air-track gliders</b></td><td>Keep friction low so that the acceleration stays close to constant.</td></tr></tbody></table></div>' +
            '<div class="diagram">' + lightGates + '</div>',
          example: '<p>A 0.100 m card takes 0.125 s to pass gate 1 and 0.050 s to pass gate 2. The trolley takes 0.60 s to travel between the gates.</p>' +
            '<p>' + m('u') + ' = 0.100 ÷ 0.125 = 0.80 m s⁻¹ and ' + m('v') + ' = 0.100 ÷ 0.050 = 2.00 m s⁻¹.</p>' +
            '<p>' + m('a = (v - u) / t') + ' = (2.00 − 0.80) ÷ 0.60 = <b>2.0 m s⁻²</b>.</p>',
          traps: ['A light gate gives the average velocity while the card passes. A shorter card gets closer to the instantaneous velocity.'] },

        { id: 'freefall', title: 'Free fall and measuring g', refs: ['3.1.2b(i)', '3.1.2b(ii)'], viz: 'freefall',
          html:
            '<ul>' +
            '<li>Near the Earth’s surface every object in free fall has the same acceleration, ' + m('g') + ' = <b>9.81 m s⁻²</b>, whatever its mass, as long as air resistance is negligible.</li>' +
            '<li><b>Electromagnet and trapdoor:</b> switching off the electromagnet releases a steel ball and starts the timer. The ball opens the trapdoor, which stops the timer. Measure the height ' + m('h') + ' with a metre rule and repeat for a range of heights.</li>' +
            '<li>The ball starts from rest, so ' + m('h = ½gt^2') + '. Plot ' + m('h') + ' against ' + m('t^2') + ': the gradient is ' + m('½g') + '.</li>' +
            '<li><b>Light gates:</b> drop a card through two gates a known distance apart, find the velocity at each and use ' + m('v^2 = u^2 + 2gs') + '.</li>' +
            '<li>Sources of error: the electromagnet can hold on for a moment after it is switched off, and air resistance slows the ball. Use a small, dense ball and measure ' + m('h') + ' from the bottom of the ball.</li>' +
            '</ul>',
          example: '<p>A mechanic drops a wheel nut from 1.00 m above the garage floor.</p>' +
            '<p>' + m('s = ut + ½at^2') + ' with ' + m('u') + ' = 0 gives ' + m('t = √(2s / g)') + ' = √(2 × 1.00 ÷ 9.81) = <b>0.452 s</b>.</p>' +
            '<p>It lands at ' + m('v = u + at') + ' = 9.81 × 0.452 = <b>4.43 m s⁻¹</b>.</p>',
          traps: ['At the top of a throw the velocity is zero, but the acceleration is still 9.81 m s⁻² downwards.', 'Decide whether up or down is positive and stick to it for every quantity.'] },

        { id: 'stopping', title: 'Stopping distances', refs: ['3.1.2c'], viz: 'stopping',
          html:
            '<ul>' +
            '<li><b>Thinking distance</b> is how far the vehicle travels during the driver’s reaction time, at constant speed: thinking distance = speed × reaction time.</li>' +
            '<li><b>Braking distance</b> is how far it travels once the brakes are on. With ' + m('v') + ' = 0 in ' + m('v^2 = u^2 + 2as') + ', braking distance = ' + m('u^2 / 2a') + ' for a deceleration of size ' + m('a') + '.</li>' +
            '<li><b>Stopping distance</b> = thinking distance + braking distance.</li>' +
            '<li>Thinking distance is proportional to speed. Braking distance is proportional to speed <b>squared</b>.</li>' +
            '<li>Tiredness, alcohol, drugs and distractions lengthen the reaction time. Wet or icy roads and worn tyres or brakes lengthen the braking distance.</li>' +
            '</ul>',
          example: '<p>A car travels at 30 m s⁻¹. The driver’s reaction time is 0.70 s and the brakes give a deceleration of 7.5 m s⁻².</p>' +
            '<p>Thinking distance = 30 × 0.70 = 21 m. Braking distance = 30² ÷ (2 × 7.5) = 60 m. Stopping distance = <b>81 m</b>.</p>' +
            '<p>At half the speed, 15 m s⁻¹, it is 10.5 + 15 = 25.5 m. Doubling the speed makes the stopping distance about <b>3.2 times</b> longer.</p>',
          traps: ['Reaction time changes the thinking distance only.', 'Road, tyre and brake conditions change the braking distance only.'] }
      ] },

      { id: '3.1.3', title: 'Projectile motion', blocks: [
        { id: 'projectiles', title: 'Two independent motions', refs: ['3.1.3a', '3.1.3b'], viz: 'jump',
          html:
            '<ul>' +
            '<li>A projectile is an object moving through the air with only its weight acting on it. Air resistance is ignored.</li>' +
            '<li><b>Horizontally</b> there is no force, so the horizontal velocity stays constant.</li>' +
            '<li><b>Vertically</b> the weight gives a constant acceleration of ' + m('g') + ' downwards, so the suvat equations apply.</li>' +
            '<li>The two motions are <b>independent</b>. The only quantity they share is the time.</li>' +
            '<li>Resolve the launch velocity first: ' + m('u_{x} = u "cos" θ') + ' and ' + m('u_{y} = u "sin" θ') + ', where ' + m('θ') + ' is measured from the horizontal.</li>' +
            '</ul>' +
            '<div class="eqn">' + m('x = u_{x}t') + '<small>horizontal: constant velocity</small>' + m('y = u_{y}t - ½gt^2') + '<small>vertical: constant acceleration</small></div>' +
            '<p>The usual route is: use the vertical motion to find the time, then use the horizontal motion to find how far.</p>',
          example: '<p>A car leaves a crest travelling horizontally at 40.0 m s⁻¹ and lands 1.50 m lower.</p>' +
            '<p>Vertical: ' + m('u_{y}') + ' = 0, so ' + m('t = √(2s / g)') + ' = √(2 × 1.50 ÷ 9.81) = <b>0.553 s</b>.</p>' +
            '<p>Horizontal: distance = 40.0 × 0.553 = <b>22.1 m</b>.</p>' +
            '<p>On landing, ' + m('v_{y}') + ' = 9.81 × 0.553 = 5.42 m s⁻¹, so its speed is √(40.0² + 5.42²) = <b>40.4 m s⁻¹</b>.</p>',
          traps: ['Never put a horizontal quantity and a vertical quantity into the same suvat equation.', 'At the highest point only the vertical velocity is zero. The projectile is still moving horizontally.'] }
      ] }
    ],

    /* Static numbers quoted on this page, recalculated by tools/check.mjs. [label, stated value, calculation] */
    checks: [
      ['lap average speed', 64.4, () => 5800 / 90], ['launch acceleration', 11.2, () => 28 / 2.5],
      ['graph acceleration', 12, () => (80 - 20) / 5], ['graph displacement', 490, () => 0.5 * (20 + 80) * 5 + 80 * 3],
      ['braking distance', 83.1, () => (25 * 25 - 90 * 90) / (2 * -45)], ['braking time', 1.44, () => (25 - 90) / -45],
      ['light gate acceleration', 2.0, () => (0.1 / 0.05 - 0.1 / 0.125) / 0.6],
      ['wheel nut fall time', 0.452, () => Math.sqrt(2 / G)], ['wheel nut landing speed', 4.43, () => G * Math.sqrt(2 / G)],
      ['stopping distance', 81, () => 30 * 0.7 + 900 / 15], ['stopping at half speed', 25.5, () => 15 * 0.7 + 225 / 15], ['stopping ratio', 3.2, () => 81 / 25.5],
      ['crest time', 0.553, () => Math.sqrt(3 / G)], ['crest range', 22.1, () => 40 * Math.sqrt(3 / G)], ['crest vy', 5.42, () => G * Math.sqrt(3 / G)], ['crest landing speed', 40.4, () => Math.hypot(40, G * Math.sqrt(3 / G))],
      ['W3 rise', 1.83, () => 36 / (2 * G)], ['W3 max height', 3.03, () => 1.2 + 36 / (2 * G)], ['W3 landing speed', 7.72, () => Math.sqrt(36 + 2 * G * 1.2)],
      ['W4 uy', 6.47, () => 25 * Math.sin(15 * Math.PI / 180)], ['W4 time', 1.32, () => 2 * 25 * Math.sin(15 * Math.PI / 180) / G],
      ['W4 ux', 24.1, () => 25 * Math.cos(15 * Math.PI / 180)], ['W4 range', 31.9, () => 25 * Math.cos(15 * Math.PI / 180) * 2 * 25 * Math.sin(15 * Math.PI / 180) / G]
    ],

    quiz: {
      intro: 'Fifteen questions on kinematics, linear motion and projectiles. Ten are marked for you and five are exam-style questions that you mark against the mark scheme. Allow about 30 minutes. You need a calculator and paper. Use g = 9.81 m s⁻² and ignore air resistance unless told otherwise.',
      questions: [
        { id: 'q1', type: 'mc', refs: ['3.1.1a'],
          q: 'A car completes one full lap of a 5.9 km circuit in 92 s and crosses the line exactly where it started. What is its average velocity for the lap?',
          options: ['0 m s⁻¹', '64 m s⁻¹', '32 m s⁻¹', '128 m s⁻¹'], answer: 0,
          why: 'Average velocity = displacement ÷ time. After a full lap the car is back where it started, so its displacement is zero. 64 m s⁻¹ is its average <b>speed</b> (5900 ÷ 92).' },

        { id: 'q2', type: 'mc', refs: ['3.1.1b', '3.1.1c'],
          q: 'The displacement–time graph for a car leaving the pit lane is shown. Which statement describes its motion?',
          fig: () => OL.figGraph({ x1: 6, y1: 90, xstep: 1, ystep: 10, xl: 't / s', yl: 's / m', numbers: false, alt: 'A displacement–time graph that starts flat and curves upwards, getting steeper', pts: Array.from({ length: 31 }, (_, i) => [i / 5, 2.4 * (i / 5) * (i / 5)]) }),
          options: ['Its velocity is increasing', 'It is moving at constant velocity', 'It is slowing down', 'It is stationary'], answer: 0,
          why: 'The gradient of a displacement–time graph is the velocity. The curve gets steeper, so the velocity is increasing: the car is accelerating.' },

        { id: 'q3', type: 'num', refs: ['3.1.1a'],
          make: function (R) {
            const v = R.pick([24, 26, 28, 30, 32]), t = R.pick([2.2, 2.4, 2.5, 2.6, 2.8]), ans = v / t;
            return { ans: ans, unit: 'm s⁻²', check: (v * 10) / (t * 10),
              q: 'A car leaves its grid slot from rest and reaches ' + v + MS + ' in ' + t.toFixed(1) + ' s. Calculate its average acceleration.',
              sol: m('a = Δv / Δt') + ' = (' + v + ' − 0) ÷ ' + t.toFixed(1) + ' = <b>' + sf(ans) + MS2 + '</b>' };
          } },

        { id: 'q4', type: 'num', refs: ['3.1.1b', '3.1.1d'],
          make: function (R) {
            const u = R.pick([0, 10, 20]), v = R.pick([50, 60, 70, 80]), t1 = R.pick([3, 4, 5, 6]), t2 = R.pick([2, 3, 4]);
            const ans = 0.5 * (u + v) * t1 + v * t2;
            let area = 0;   // independent check: add up thin strips under the line
            const N = 20000, T = t1 + t2, vel = (t) => (t < t1 ? u + ((v - u) * t) / t1 : v);
            for (let i = 0; i < N; i++) area += vel(((i + 0.5) * T) / N) * (T / N);
            return { ans: ans, unit: 'm', check: area, checkTol: 1e-4,
              q: 'The velocity–time graph shows a car on the start–finish straight. Use the graph to find the displacement of the car during the ' + T + ' s shown.',
              fig: OL.figGraph({ x1: T, y1: 90, xstep: 1, ystep: 10, xl: 't / s', yl: 'v / m s⁻¹', alt: 'Velocity–time graph: a straight line from ' + u + ' metres per second at 0 seconds up to ' + v + ' metres per second at ' + t1 + ' seconds, then horizontal at ' + v + ' metres per second until ' + T + ' seconds', pts: [[0, u], [t1, v], [T, v]] }),
              sol: 'Displacement is the area under the graph. First ' + t1 + ' s (a trapezium): ½(' + u + ' + ' + v + ') × ' + t1 + ' = ' + 0.5 * (u + v) * t1 + ' m. Next ' + t2 + ' s (a rectangle): ' + v + ' × ' + t2 + ' = ' + v * t2 + ' m. Total = <b>' + sf(ans) + ' m</b>' };
          } },

        { id: 'q5', type: 'num', refs: ['3.1.2a(i)'],
          make: function (R) {
            const u = R.pick([18, 20, 22, 25]), a = R.pick([6, 7, 8, 9]), t = R.pick([2.0, 2.5, 3.0, 3.5]);
            const ans = u * t + 0.5 * a * t * t, v = u + a * t;
            return { ans: ans, unit: 'm', check: (v * v - u * u) / (2 * a),
              q: 'A car leaves a corner at ' + u + MS + ' and accelerates along the straight at a constant ' + a + MS2 + ' for ' + t.toFixed(1) + ' s. Calculate how far it travels in this time.',
              sol: m('s = ut + ½at^2') + ' = (' + u + ' × ' + t.toFixed(1) + ') + (½ × ' + a + ' × ' + t.toFixed(1) + '²) = ' + sf(u * t) + ' + ' + sf(0.5 * a * t * t) + ' = <b>' + sf(ans) + ' m</b>' };
          } },

        { id: 'q6', type: 'num', refs: ['3.1.2a(i)'],
          make: function (R) {
            const u = R.pick([80, 84, 88, 90]), v = R.pick([20, 24, 28, 30]), a = R.pick([40, 42, 45, 48, 50]);
            const ans = (u * u - v * v) / (2 * a), t = (u - v) / a;
            return { ans: ans, unit: 'm', check: 0.5 * (u + v) * t,
              q: 'A car approaches a hairpin at ' + u + MS + '. It brakes with a constant deceleration of ' + a + MS2 + ' until its speed is ' + v + MS + '. Calculate the distance it travels while braking.',
              sol: 'No time is given, so use ' + m('v^2 = u^2 + 2as') + ' with ' + m('a') + ' = −' + a + MS2 + '. &nbsp;' + m('s = (v^2 - u^2) / 2a') + ' = (' + v + '² − ' + u + '²) ÷ (2 × −' + a + ') = <b>' + sf(ans) + ' m</b>' };
          } },

        { id: 'w1', type: 'written', refs: ['3.1.2a(ii)'], marks: 4,
          q: '<p>A student has a trolley, a ramp, a card, two light gates and a data-logger.</p><p>Describe how the student could use this equipment to determine the acceleration of the trolley as it rolls down the ramp.</p>',
          scheme: [
            'Fix the card to the trolley and measure the length of the card with a ruler.',
            'The data-logger records the time the card takes to pass through each light gate.',
            'Velocity at each gate = length of card ÷ time taken to pass that gate.',
            'Measure the time taken to travel between the gates and use a = (v − u) ÷ t, OR measure the distance between the gates and use v² = u² + 2as.'
          ],
          tip: 'Say what is measured, what it is measured with and how the measurements are turned into the answer.' },

        { id: 'q7', type: 'mc', refs: ['3.1.2b(ii)'],
          q: 'A ball is dropped from rest through a height h and the time of fall t is measured. This is repeated for several heights. A graph of h (vertical axis) against t² (horizontal axis) is a straight line through the origin. What is the gradient of the line?',
          options: ['½g', 'g', '2g', 'g²'], answer: 0,
          why: 'From rest, ' + m('h = ½gt^2') + '. Comparing with ' + m('y = mx') + ', where ' + m('y = h') + ' and ' + m('x = t^2') + ', the gradient is ' + m('½g') + '. So ' + m('g') + ' = 2 × gradient.' },

        { id: 'w2', type: 'written', refs: ['3.1.2b(ii)'], marks: 5,
          q: '<p>A student uses an electromagnet, a steel ball, a trapdoor and an electronic timer to determine the acceleration of free fall, g.</p><p>Describe the measurements the student should take and explain how a graph can be used to find g. Include one way of making the result more accurate.</p>',
          scheme: [
            'Measure the height h from the bottom of the ball to the trapdoor using a metre rule.',
            'The timer starts when the electromagnet is switched off and stops when the ball opens the trapdoor, giving the time of fall t.',
            'Repeat for a range of heights (and repeat each height to find a mean time).',
            'Plot a graph of h against t² (or 2h against t²).',
            'g = 2 × gradient (or g = gradient if 2h is plotted).',
            'Accuracy: use a small, dense ball to reduce air resistance, OR use the smallest current that will hold the ball so that it is released without delay, OR use larger heights to reduce the percentage uncertainty in t.'
          ],
          max: 5,
          tip: 'There are six creditworthy points here for five marks. A graph answer always needs: what goes on each axis and what the gradient equals.' },

        { id: 'w3', type: 'written', refs: ['3.1.2a(i)', '3.1.2b(i)'], marks: 5,
          q: '<p>A mechanic throws a wheel nut vertically upwards at 6.0 m s⁻¹. It leaves the mechanic’s hand 1.2 m above the garage floor.</p><p>(a) Calculate the maximum height of the wheel nut above the floor. [2]</p><p>(b) Calculate the speed of the wheel nut as it hits the floor. [2]</p><p>(c) State the acceleration of the wheel nut at its highest point and explain your answer. [1]</p>',
          scheme: [
            '(a) Uses v² = u² + 2as with v = 0: rise = 6.0² ÷ (2 × 9.81) = 1.83 m.',
            '(a) Maximum height above the floor = 1.2 + 1.83 = 3.0 m (3.03 m).',
            '(b) Uses v² = u² + 2as from the hand to the floor: v² = 6.0² + (2 × 9.81 × 1.2), OR falls 3.03 m from rest: v² = 2 × 9.81 × 3.03.',
            '(b) v = 7.7 m s⁻¹.',
            '(c) 9.81 m s⁻² downwards, because its weight is the only force acting on it (the velocity is zero there, but the acceleration is not).'
          ],
          tip: 'In (b), taking down as positive from the hand: u = −6.0, a = +9.81, s = +1.2. Squaring u removes the sign.' },

        { id: 'q8', type: 'num', refs: ['3.1.2c'],
          make: function (R) {
            const u = R.pick([20, 25, 30]), tr = R.pick([0.6, 0.7, 0.8, 0.9]), a = R.pick([5, 6, 7, 8]);
            const think = u * tr, brake = (u * u) / (2 * a), ans = think + brake;
            let d = 0, v = u;   // independent check: step the motion through time
            const dt = 1e-5;
            for (let t = 0; v > 0; t += dt) { const nv = t < tr ? u : Math.max(0, v - a * dt); d += 0.5 * (v + nv) * dt; v = t < tr ? u : nv; }
            return { ans: ans, unit: 'm', check: d, checkTol: 1e-3,
              q: 'A safety car is travelling at ' + u + MS + ' when its driver sees debris on the track. The driver’s reaction time is ' + tr.toFixed(1) + ' s. The brakes then give a constant deceleration of ' + a + MS2 + '. Calculate the total stopping distance.',
              sol: 'Thinking distance = ' + u + ' × ' + tr.toFixed(1) + ' = ' + sf(think) + ' m. Braking distance = ' + m('u^2 / 2a') + ' = ' + u + '² ÷ (2 × ' + a + ') = ' + sf(brake) + ' m. Stopping distance = <b>' + sf(ans) + ' m</b>' };
          } },

        { id: 'w4', type: 'written', refs: ['3.1.2c'], marks: 4,
          q: '<p>A driver doubles the speed of a car.</p><p>Explain why the stopping distance of the car more than doubles. Assume the driver’s reaction time and the deceleration of the car stay the same.</p>',
          scheme: [
            'Stopping distance = thinking distance + braking distance.',
            'Thinking distance = speed × reaction time, so it doubles (it is proportional to speed).',
            'Braking distance = u² ÷ 2a (from v² = u² + 2as with v = 0), so it is proportional to speed squared.',
            'The braking distance becomes four times as large, so the total is more than doubled (between two and four times).'
          ],
          tip: 'Name both parts of the stopping distance and say how each one depends on speed.' },

        { id: 'q9', type: 'mc', refs: ['3.1.3a'],
          q: 'Two identical wheel nuts are the same height above a level garage floor. At the same instant, one is dropped from rest and the other is fired horizontally at 15 m s⁻¹. Air resistance is negligible. Which statement is correct?',
          options: ['They hit the floor at the same time', 'The dropped nut hits the floor first', 'The fired nut hits the floor first', 'The fired nut never reaches the floor'], answer: 0,
          why: 'Vertical and horizontal motion are independent. Both nuts start with zero vertical velocity, fall the same height and have the same vertical acceleration g, so they take the same time. The horizontal velocity only changes where the fired nut lands.' },

        { id: 'q10', type: 'num', refs: ['3.1.3b'],
          make: function (R) {
            const ux = R.pick([20, 24, 28, 32, 36]), h = R.pick([0.8, 1.0, 1.25, 1.5, 1.8]);
            const t = Math.sqrt((2 * h) / G), ans = ux * t;
            let x = 0, y = 0, vy = 0;   // independent check: step the flight through time until it has fallen h
            const dt = 1e-6;
            while (y < h) { vy += G * dt; y += vy * dt; x += ux * dt; }
            return { ans: ans, unit: 'm', check: x, checkTol: 1e-3,
              q: 'A rally car leaves the horizontal lip of a jump at ' + ux + MS + ' and lands on level ground ' + h.toFixed(2) + ' m below the lip. Calculate the horizontal distance it travels through the air.',
              sol: 'Vertical (starts with no vertical velocity): ' + m('s = ½gt^2') + ', so ' + m('t = √(2s / g)') + ' = √(2 × ' + h.toFixed(2) + ' ÷ 9.81) = ' + sf(t) + ' s. Horizontal (constant velocity): distance = ' + ux + ' × ' + sf(t) + ' = <b>' + sf(ans) + ' m</b>' };
          } },

        { id: 'w5', type: 'written', refs: ['3.1.3a', '3.1.3b'], marks: 6,
          q: '<p>A rally car leaves a ramp at 25 m s⁻¹ at an angle of 15° above the horizontal. It lands at the same height as it took off.</p><p>(a) Show that the car is in the air for about 1.3 s. [3]</p><p>(b) Calculate the horizontal distance between take-off and landing. [2]</p><p>(c) Explain why the horizontal velocity of the car stays constant during the jump. [1]</p>',
          scheme: [
            '(a) Vertical component of the velocity = 25 sin 15° = 6.47 m s⁻¹.',
            '(a) Uses a suvat equation for the vertical motion, e.g. s = ut + ½at² with s = 0, or v = u + at to the top (0.66 s) then doubles it.',
            '(a) t = 2 × 6.47 ÷ 9.81 = 1.32 s.',
            '(b) Horizontal component of the velocity = 25 cos 15° = 24.1 m s⁻¹.',
            '(b) Distance = 24.1 × 1.32 = 32 m (31.9 m; 31 m if 1.3 s is used).',
            '(c) There is no horizontal force on the car (air resistance is ignored), so there is no horizontal acceleration.'
          ],
          tip: 'In a “show that” question, give your answer to one more significant figure than the value you are asked to show.' }
      ]
    }
  });
})();
