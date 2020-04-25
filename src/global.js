const PI = Math.PI;
const PI2 = PI * 2;

const SPEED = 2;
const SICK_TIMEFRAME = 275;
const CRITICAL_TIMEFRAME = 5;
const CRITICAL_FATALITY_RATE = 0.1;

const COLOR = {
    recovered: "violet",
    sick: "tomato",
    dead: "white",
    healthy: "#00d1b2"
};

const STATUSES = {
    sick: 'sick',
    dead: 'dead',
    recovered: 'recovered',
    healthy: 'healthy',
    critical: 'critical'
};

const RADIANS = degrees => {
    return degrees * PI / 180;
};

const NORMAL = degrees => {
    return { x: Math.sin(RADIANS(degrees)), y: -Math.cos(RADIANS(degrees)) };
};

const WALLS = {
    N: { velocity: NORMAL(0) },
    S: { velocity: NORMAL(0) },
    E: { velocity: NORMAL(90) },
    W: { velocity: NORMAL(90) }
};

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
};

const MESSAGE_TYPE = {
    pause_sim: 1,
};