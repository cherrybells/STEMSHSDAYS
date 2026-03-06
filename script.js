/* ==========================================
   FLAPPY HIRONO GAME – FULL JS (CONTAINER READY)
========================================== */

/* ===== CONFIG ===== */
const CONFIG = {
    pipeSpeed: 200,          // moderate speed
    gravity: 850,            // natural fall
    jumpForce: 300,          // balanced jump
    pipeGapDesktop: 400,     // LARGE gap for desktop
    pipeGapMobile: 350,      // LARGE gap for mobile
    pipeSpacingDesktop: 2.0,
    pipeSpacingMobile: 1.7
};

/* ===== ELEMENTS ===== */
const container = document.querySelector('.maincontent');
const bird = document.querySelector('.hironobird');
const img = document.getElementById('bird');
const score_val = document.querySelector('.score_val');
const message = document.querySelector('.message');
const score_title = document.querySelector('.score_title');

/* ===== STATE ===== */
let game_state = 'Start';
let velocity = 0;
let lastTime = null;
let pipeTimer = 0;
let score = 0;

img.style.display = 'none';
message.classList.add('messageStyle');

/* ===== START GAME ===== */
function startGame() {
    if (game_state === 'Play') return;

    game_state = 'Play';
    velocity = 0;
    lastTime = null;
    pipeTimer = 0;
    score = 0;

    document.querySelectorAll('.pipe_sprite').forEach(p => p.remove());

    bird.style.top = container.offsetHeight * 0.45 + 'px'; // relative to container
    img.style.display = 'block';

    score_val.innerHTML = '0';
    score_title.innerHTML = 'Score : ';
    message.innerHTML = '';
    message.classList.remove('messageStyle');

    requestAnimationFrame(gameLoop);
}

/* ===== JUMP ===== */
function jump() {
    if (game_state !== 'Play') return;
    if (velocity > 200) velocity = 200;
    velocity = -CONFIG.jumpForce;
}

/* ===== CONTROLS ===== */
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') startGame();
    if (e.key === 'ArrowUp') jump();
});

container.addEventListener('touchstart', () => {
    if (game_state !== 'Play') startGame();
    else jump();
});

/* ===== MAIN LOOP ===== */
function gameLoop(timestamp) {
    if (game_state !== 'Play') return;

    if (!lastTime) lastTime = timestamp;
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    updateBird(delta);
    updatePipes(delta);
    createPipes(delta);

    requestAnimationFrame(gameLoop);
}

/* ===== BIRD PHYSICS ===== */
function updateBird(delta) {
    velocity += CONFIG.gravity * delta;
    const newTop = bird.offsetTop + velocity * delta;
    const containerHeight = container.offsetHeight;

    if (newTop <= 0 || (newTop + bird.offsetHeight) >= containerHeight) {
        endGame();
    } else {
        bird.style.top = newTop + 'px';
    }
}

/* ===== PIPE MOVEMENT + COLLISION ===== */
function updatePipes(delta) {
    const pipes = container.querySelectorAll('.pipe_sprite');
    const birdRect = bird.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    pipes.forEach(pipe => {
        const rect = pipe.getBoundingClientRect();
        const newLeft = pipe.offsetLeft - CONFIG.pipeSpeed * delta;
        pipe.style.left = newLeft + 'px';

        if (newLeft + pipe.offsetWidth < 0) pipe.remove();

        // collision check
        if (
            birdRect.left < rect.right &&
            birdRect.right > rect.left &&
            birdRect.top < rect.bottom &&
            birdRect.bottom > rect.top
        ) {
            endGame();
        }

        // score increment
        if (pipe.increase_score === '1' && rect.right < birdRect.left) {
            score++;
            score_val.innerHTML = score;
            pipe.increase_score = '0';
        }
    });
}

/* ===== PIPE CREATION ===== */
function createPipes(delta) {
    pipeTimer += delta;

    const isMobile = window.innerWidth < 768;
    const spacing = isMobile ? CONFIG.pipeSpacingMobile : CONFIG.pipeSpacingDesktop;

    if (pipeTimer < spacing) return;
    pipeTimer = 0;

    const gap = isMobile ? CONFIG.pipeGapMobile : CONFIG.pipeGapDesktop;
    const minPipeHeight = 50;
    const containerHeight = container.offsetHeight;
    const maxPipeHeight = containerHeight - gap - minPipeHeight;

    const topHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
    const bottomHeight = containerHeight - gap - topHeight;

    // TOP PIPE
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe_sprite';
    topPipe.style.height = topHeight + 'px';
    topPipe.style.top = '0px';
    topPipe.style.left = container.offsetWidth + 'px';
    topPipe.increase_score = '0';
    container.appendChild(topPipe);

    // BOTTOM PIPE
    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe_sprite';
    bottomPipe.style.height = bottomHeight + 'px';
    bottomPipe.style.top = topHeight + gap + 'px';
    bottomPipe.style.left = container.offsetWidth + 'px';
    bottomPipe.increase_score = '1';
    container.appendChild(bottomPipe);
}

/* ===== END GAME ===== */
function endGame() {
    game_state = 'End';
    img.style.display = 'none';
    message.innerHTML =
        '<span style="color:red;">Game Over</span><br>Press Enter / Tap to Restart';
    message.classList.add('messageStyle');
}
