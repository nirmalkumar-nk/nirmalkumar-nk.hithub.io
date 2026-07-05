const GLOW_INTERVAL_MS = 2500;
const WORD_REVEAL_DELAY_MS = 500;
const STAR_COUNT = 40;
const STAR_SCROLL_RANGE_PX = 500;

function createStarField(container, count) {
    for (let i = 0; i < count; i++) {
        const star = document.createElement("span");
        star.className = "star";
        star.style.setProperty("--x", `${Math.random() * 100}%`);
        star.style.setProperty("--y", `${Math.random() * 100}%`);
        star.style.setProperty("--depth", `${Math.random() * -400}px`);
        star.style.setProperty("--size", `${Math.random() * 3 + 1}px`);
        container.appendChild(star);
    }
}

function initStarScroll(container) {
    let ticking = false;

    function update() {
        const rect = container.getBoundingClientRect();
        const distanceFromCenter = window.innerHeight / 2 - (rect.top + rect.height / 2);
        const shift = Math.max(-STAR_SCROLL_RANGE_PX, Math.min(STAR_SCROLL_RANGE_PX, distanceFromCenter));
        container.style.setProperty("--scroll-shift", `${shift}px`);
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    });
    update();
}

const SHOOTING_STAR_MIN_INTERVAL_MS = 900;
const SHOOTING_STAR_MAX_INTERVAL_MS = 1800;
const SHOOTING_STAR_MAX_CONCURRENT = 3;

function spawnShootingStar(container) {
    const star = document.createElement("span");
    star.className = "shooting-star";
    star.style.setProperty("--start-x", `${Math.random() * 80}%`);
    star.style.setProperty("--start-y", `${Math.random() * 40}%`);
    star.style.setProperty("--angle", `${25 + Math.random() * 20}deg`);
    star.style.setProperty("--distance", `${300 + Math.random() * 300}px`);
    star.style.setProperty("--duration", `${1 + Math.random()}s`);
    star.addEventListener("animationend", () => star.remove());
    container.appendChild(star);
}

function scheduleShootingStars(container) {
    function loop() {
        if (container.children.length < SHOOTING_STAR_MAX_CONCURRENT) {
            spawnShootingStar(container);
        }
        const delay = SHOOTING_STAR_MIN_INTERVAL_MS
            + Math.random() * (SHOOTING_STAR_MAX_INTERVAL_MS - SHOOTING_STAR_MIN_INTERVAL_MS);
        setTimeout(loop, delay);
    }
    loop();
}

const BODY_BG_START = [1, 21, 48];
const BODY_BG_END = [201, 178, 140];

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function updateBodyBackground() {
    const scrollTop = window.scrollY;
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? Math.min(1, Math.max(0, scrollTop / scrollRange)) : 0;

    const r = Math.round(lerp(BODY_BG_START[0], BODY_BG_END[0], progress));
    const g = Math.round(lerp(BODY_BG_START[1], BODY_BG_END[1], progress));
    const b = Math.round(lerp(BODY_BG_START[2], BODY_BG_END[2], progress));
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

function initBodyBackgroundScroll() {
    let ticking = false;

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateBodyBackground();
                ticking = false;
            });
            ticking = true;
        }
    });
    updateBodyBackground();
}

function toggleGlow() {
    document.querySelectorAll(".name").forEach((el) => el.classList.toggle("glow"));
}

function revealWords(onDone) {
    const words = document.querySelectorAll(".names .word");
    words.forEach((el, index) => {
        setTimeout(() => el.classList.add("reveal"), index * WORD_REVEAL_DELAY_MS);
    });
    setTimeout(onDone, words.length * WORD_REVEAL_DELAY_MS);
}

window.onload = () => {
    initBodyBackgroundScroll();

    const starsField = document.getElementById("starsField");
    if (starsField) {
        createStarField(starsField, STAR_COUNT);
        initStarScroll(starsField);
    }

    const shootingStars = document.getElementById("shootingStars");
    if (shootingStars) {
        scheduleShootingStars(shootingStars);
    }

    revealWords(() => setInterval(toggleGlow, GLOW_INTERVAL_MS));
};