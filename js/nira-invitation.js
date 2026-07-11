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

const TINT_COLOR_START = [1, 21, 48];
const TINT_COLOR_END = [201, 178, 140];

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function updateScrollTint(tintEl) {
    const scrollTop = window.scrollY;
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? Math.min(1, Math.max(0, scrollTop / scrollRange)) : 0;

    const r = Math.round(lerp(TINT_COLOR_START[0], TINT_COLOR_END[0], progress));
    const g = Math.round(lerp(TINT_COLOR_START[1], TINT_COLOR_END[1], progress));
    const b = Math.round(lerp(TINT_COLOR_START[2], TINT_COLOR_END[2], progress));
    tintEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

function initScrollTint(tintEl) {
    let ticking = false;

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollTint(tintEl);
                ticking = false;
            });
            ticking = true;
        }
    });
    updateScrollTint(tintEl);
}

const SCRATCH_REVEAL_THRESHOLD = 0.5;
const SCRATCH_BRUSH_RADIUS = 18;
const PETAL_COUNT = 40;

function initScratchCard(card, onRevealed) {
    const canvas = card.querySelector(".scratch-canvas");
    const ctx = canvas.getContext("2d");
    const hint = card.dataset.hint || "Scratch";
    let isScratching = false;
    let revealed = false;

    function paintScratchLayer() {
        const rect = card.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#c9a25b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#4a3418";
        ctx.font = `600 ${Math.max(10, canvas.width * 0.14)}px Georgia, serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hint, canvas.width / 2, canvas.height / 2);
    }

    function scratchAt(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, SCRATCH_BRUSH_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    }

    function getScratchedRatio() {
        const { width, height } = canvas;
        const { data } = ctx.getImageData(0, 0, width, height);
        let cleared = 0;
        let total = 0;
        for (let i = 3; i < data.length; i += 4 * 8) {
            total++;
            if (data[i] === 0) {
                cleared++;
            }
        }
        return total > 0 ? cleared / total : 0;
    }

    function revealCard() {
        revealed = true;
        canvas.classList.add("revealed");

        if (onRevealed) {
            onRevealed();
        }
    }

    function handleMove(clientX, clientY) {
        if (!isScratching || revealed) {
            return;
        }
        scratchAt(clientX, clientY);
        if (getScratchedRatio() > SCRATCH_REVEAL_THRESHOLD) {
            revealCard();
        }
    }

    canvas.addEventListener("pointerdown", (e) => {
        isScratching = true;
        canvas.setPointerCapture(e.pointerId);
        scratchAt(e.clientX, e.clientY);
    });
    canvas.addEventListener("pointermove", (e) => handleMove(e.clientX, e.clientY));
    canvas.addEventListener("pointerup", () => {
        isScratching = false;
    });
    canvas.addEventListener("pointercancel", () => {
        isScratching = false;
    });

    paintScratchLayer();
}

function initScratchCards(cards, onAllRevealed) {
    let revealedCount = 0;
    cards.forEach((card) => {
        initScratchCard(card, () => {
            revealedCount++;
            if (revealedCount === cards.length) {
                onAllRevealed();
            }
        });
    });
}

function spawnPetalConfetti(container, count) {
    for (let i = 0; i < count; i++) {
        const petal = document.createElement("span");
        petal.className = "petal";
        petal.style.setProperty("--left", `${Math.random() * 100}%`);
        petal.style.setProperty("--size", `${8 + Math.random() * 10}px`);
        petal.style.setProperty("--drift", `${Math.random() * 120 - 60}px`);
        petal.style.setProperty("--spin", `${Math.random() * 360}deg`);
        petal.style.setProperty("--duration", `${3 + Math.random() * 2}s`);
        petal.style.setProperty("--delay", `${Math.random() * 0.8}s`);
        petal.addEventListener("animationend", () => petal.remove());
        container.appendChild(petal);
    }
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
    const scrollTint = document.getElementById("scrollTint");
    if (scrollTint) {
        initScrollTint(scrollTint);
    }

    const starsField = document.getElementById("starsField");
    if (starsField) {
        createStarField(starsField, STAR_COUNT);
        initStarScroll(starsField);
    }

    const shootingStars = document.getElementById("shootingStars");
    if (shootingStars) {
        scheduleShootingStars(shootingStars);
    }

    const scratchCards = document.querySelectorAll(".scratch-card");
    if (scratchCards.length) {
        initScratchCards(scratchCards, () => {
            const confetti = document.getElementById("petalConfetti");
            if (confetti) {
                spawnPetalConfetti(confetti, PETAL_COUNT);
            }
        });
    }

    revealWords(() => setInterval(toggleGlow, GLOW_INTERVAL_MS));
};