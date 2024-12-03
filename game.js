const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

var scalar = Math.min(window.innerWidth, window.innerHeight) / 80; // Adjust the divisor to change grid coverage
canvas.width = window.innerWidth; // Set canvas width to full window width
canvas.height = window.innerHeight; // Set canvas height to full window height
let filled = Array.from({ length: 8 }, () => Array(8).fill(0));
var busting = false;

var mousePosition = { x: 0, y: 0 };
var dragging = null;

var score = 0;
const scoreText = document.getElementById('score');

const zeroPad = (num, places) => String(num).padStart(places, '0');



var blocks = [];
const blockSelection = 36;

var highScore = 0;
const highScoreText = document.getElementById('high-score');

highScore = parseInt(localStorage.getItem('high-score'));
if (highScore == null || isNaN(highScore)) {
    highScore = 0;
    localStorage.setItem('high-score', 0);
}

if (highScore == 0) {
    highScoreText.innerHTML = '<img src="assets/Screenshot_2024-11-30_4.48.29_PM_Nero_AI_Photo_Face-removebg-preview (1).png">0';
} else {
    highScoreText.innerHTML = `<img src="assets/Screenshot_2024-11-30_4.48.29_PM_Nero_AI_Photo_Face-removebg-preview (1).png">${highScore}`;
}

function animate() {
    requestAnimationFrame(animate);
// Set the canvas size to fill more of the screen
ctx.canvas.width = 320; // Increase width
ctx.canvas.height = 500; // Increase height

ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the entire canvas

const squareSize = 40; // Size of each square
const squaresPerRow = ctx.canvas.width / squareSize; // Calculate how many squares fit in a row
const squaresPerCol = ctx.canvas.height / squareSize; // Calculate how many squares fit in a column

for (let x = 0; x < squaresPerRow; x++) {
    for (let y = 0; y < squaresPerCol; y++) {
        if (filled[x][y] == 0) {
            ctx.fillStyle = '#1E2748';
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize); // Draw the outer square
            ctx.fillStyle = '#222B4C';
            ctx.fillRect(x * squareSize + 1, y * squareSize + 1, squareSize - 2, squareSize - 2); // Draw the inner square
        } else {
            ctx.fillStyle = colors[filled[x][y] - 1];
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize); // Draw the filled square
        }
    }
}

    document.body.style.cursor = 'default';

    ctx.fillStyle = '#324c83';
    ctx.fillRect(0, squaresPerCol * squareSize, ctx.canvas.width, 200); // Adjust height as needed

    for (let i = 0; i < blocks.length; i++) {
        blocks[i].render();
    }

    if (dragging != null) {
        dragging.block.width = 40;
        dragging.block.height = 40;
        document.body.style.cursor = 'grabbing';

        let newX = mousePosition.x - dragging.offsetX;
        let newY = mousePosition.y - dragging.offsetY;

        // Snap to grid for dragging
        if (newY < squaresPerCol * squareSize && !checkOverlapY(dragging.block, newY)) {
            let snapX = Math.floor(newX / squareSize) * squareSize; // Snap to squareSize
            let snapY = Math.floor(newY / squareSize) * squareSize; // Snap to squareSize

            if (!checkOverlapX(dragging.block, snapX)) {
                dragging.block.x = snapX;
            }
            if (!checkOverlapY(dragging.block, snapY)) {
                dragging.block.y = snapY;
            }

            if (checkIntersect(dragging.block)) {
                dragging.block.color = 'white';
                ctx.fillStyle = 'white';
                dragging.block.render();
            } else {
                dragging.block.color = dragging.color;
            }

        } else {
            dragging.block.x = mousePosition .x - dragging.offsetX;
            dragging.block.y = mousePosition.y - dragging.offsetY;
        }
    }
}

animate();

canvas.addEventListener('mousedown', function (e) {
    if (dragging != null) {
        return;
    }

    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].checkClick(x / scalar, y / scalar) && checkBlockPossible(i)) {
            dragging = new DragRequest((x / scalar) - blocks[i].x, (y / scalar) - blocks[i].y, blocks[i], blocks[i].color);
        }
    }
});

document.body.addEventListener('mouseup', async function () {
    if (dragging == null) {
        return;
    }

    let mini = dragging.block.mini;

    if (checkIntersect(dragging.block)) {
        return;
    }

    for (let i = 0; i < mini.length; i++) {
        if ((dragging.block.x + mini[i].offsetX) / 10 >= 8 || (dragging.block.y + mini[i].offsetY) / 10 >= 8) {
            return;
        }
        filled[(dragging.block.x + mini[i].offsetX) / 10][(dragging.block.y + mini[i].offsetY) / 10] = 1;
    }

    switch (dragging.block.id) {
        case 0:
            addBlock(parseInt(Math.random() * blockSelection) + 1, 5, 110, 0);
            break;
        case 1:
            addBlock(parseInt(Math.random() * blockSelection) + 1, 35, 155, 1);
            break;
        default:
            addBlock(parseInt(Math.random() * blockSelection) + 1, 55, 110, 2);
            break;
    }

    score += 10;
    scoreText.innerText = score;

    dragging.block.color = dragging.color;
    dragging.block.disabled = true;
    dragging = null;

    playClickSound();
    await checkDestroy();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('high-score', highScore);
        highScoreText.innerHTML = `<img src="assets/Screenshot_2024-11-30_4.48.29_PM_Nero_AI_Photo_Face-removebg-preview (1).png">${highScore}`;
    }

    if (await checkGameOver()) {
        alert('Game over!');

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('high-score', highScore);
            highScoreText.innerHTML = `<img src="assets/Screenshot_2024-11-30_4.48.29_PM_Nero_AI_Photo_Face-removebg-preview (1).png">${highScore}`;
        }

        playExplosion();
        blocks = [];
        score = 0;
        scoreText.innerText = 0;
        for (let x = 0; x < filled.length; x++) {
            for (let y = 0; y < filled[x].length; y++) {
                filled[x][y] = 0;
            }
        }
        addBlock(parseInt(Math.random() * blockSelection) + 1, 5, 110, 0);
        addBlock(parseInt(Math.random() * blockSelection) + 1, 35, 155, 1);
        addBlock(parseInt(Math.random() * blockSelection) + 1, 55, 110, 2);
    }
});

document.body.addEventListener('mousemove', function (e) {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    mousePosition = { x: x / scalar, y: y / scalar }
});

canvas.addEventListener('touchstart', function (e) {
    if (dragging != null) {
        return;
    }

    let rect = canvas.getBoundingClientRect();
    let x = e.touches[0].clientX - rect.left;
    let y = e.touches[0].clientY - rect.top;

    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].checkClick(x / scalar, y / scalar) && checkBlockPossible(i)) {
            dragging = new DragRequest((x / scalar) - blocks[i].x, (y / scalar) - blocks[i].y, blocks[i], blocks[i].color);
        }
    }
});

document.body.addEventListener('touchend', async function () {
    if (dragging == null) {
        return;
    }

    let mini = dragging.block.mini;

    if (checkIntersect(dragging.block)) {
        return;
    }

    for (let i = 0; i < mini.length; i++) {
        if ((dragging.block.x + mini[i].offsetX) / 10 >= 8 || (dragging.block.y + mini[i].offsetY) / 10 >= 8) {
            return;
        }
        filled[(dragging.block.x + mini[i].offsetX) / 10][(dragging.block.y + mini[i].offsetY) / 10] = 1;
    }

    // Handle block addition and scoring as in mouseup event
    // (Add your existing logic here)

    dragging = null; // Reset dragging
});

document.body.addEventListener('touchmove', function (e) {
    let rect = canvas.getBoundingClientRect();
    let x = e.touches[0].clientX - rect.left;
    let y = e.touches[0].clientY - rect.top;

    mousePosition = { x: x / scalar, y: y / scalar };
});

function checkIntersect(block) {
    let mini = block.mini;

    for (let i = 0; i < mini.length; i++) {
        if ((dragging.block.x + mini[i].offsetX) / 10 < 10 && (dragging.block.y + mini[i].offsetY) / 10 < 10 && filled[(dragging.block.x + mini[i].offsetX) / 10][(dragging.block.y + mini[i].offsetY) / 10] == 1) {
            return true;
        }
    }
    return false;
}

async function checkGameOver() {
    await sleep(1500);

    for (let i = 0; i < blocks.length; i++) {
        if (!blocks[i].disabled) {
            for (let x = 0; x < filled.length; x++) {
                for (let y = 0; y < filled[x].length; y++) {
                    let allWork = true;
                    if (filled[x + blocks[i].mini[0].offsetX / 10][y + blocks[i].mini[0].offsetY / 10] == 0) {
                        for (let m = 0; m < blocks[i].mini.length; m++) {
                            if (x + blocks[i].mini[m].offsetX / 10 >= 8 || y + blocks[i].mini[m].offsetY / 10 >= 8) {
    allWork = false;
}
                        }
                    }
                    if (allWork && filled[x + blocks[i].mini[0].offsetX / 10][y + blocks[i].mini[0].offsetY / 10] == 0) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function checkBlockPossible(i) {
    for (let x = 0; x < filled.length; x++) {
        for (let y = 0; y < filled[x].length; y++) {
            let allWork = true;
            if (filled[x + blocks[i].mini[0].offsetX / 10][y + blocks[i].mini[0].offsetY / 10] == 0) {
                for (let m = 0; m < blocks[i].mini.length; m++) {
                    if (x + blocks[i].mini[m].offsetX / 10 >= 10 || y + blocks[i].mini[m].offsetY / 10 >= 10 || filled[x + blocks[i].mini[m].offsetX / 10][y + blocks[i].mini[m].offsetY / 10] == 1) {
                        allWork = false;
                    }
                }
            }
            if (allWork && filled[x + blocks[i].mini[0].offsetX / 10][y + blocks[i].mini[0].offsetY / 10] == 0) {
                console.log(i, x, y)
                return true;
            }
        }
    }
    return false;
}

async function checkDestroy() {
    busting = true;
    let counter = 1;

    // Check for full columns
    for (let x = 0; x < filled.length; x++) {
        let hasColumn = true;
        for (let y = 0; y < 8; y++) { // Change from filled[x].length to 8
            if (filled[x][y] == 0) {
                hasColumn = false;
                break; // Exit the loop early if a zero is found
            }
        }
        if (hasColumn) {
            await destroyColumn(x);
            counter *= 2;
        }
    }

    // Check for full rows
    for (let y = 0; y < filled[0].length; y++) {
        let hasRow = true;
        for (let x = 0; x < 8; x++) { // Change from filled.length to 8
            if (filled[x][y] == 0) {
                hasRow = false;
                break; // Exit the loop early if a zero is found
            }
        }
        if (hasRow) {
            await destroyRow(y);
            counter *= 2;
        }
    }

    score += (counter - 1) * 100;
    scoreText.innerText = score;

    if (score == 0) {
        scoreText.innerText = 0;
    }

    if (counter > 1) {
        let sound = parseInt(Math.random() * 3);
        switch (sound) {
            case 0:
                playEpicBust();
                break;
            case 1:
                playWhatABust();
                break;
            case 2:
                playSkillfulBust();
                break;
            default:
                break;
        }
    }

    await sleep(400);
    if (counter > 1) {
        for (let i = 0; i < 10; i++) {
            // Optionally play some sound effects for destroying blocks
            // playClickSound2();
            // await sleep(100);
        }
    }
}

async function destroyColumn(x) {
    for (let b = 0; b < blocks.length; b++) {
        for (let m = 0; m < blocks[b].mini.length; m++) {
            if ((blocks[b].x + blocks[b].mini[m].offsetX) / 10 == x) {
                filled[(blocks[b].x + blocks[b].mini[m].offsetX) / 10][(blocks[b].y + blocks[b].mini[m].offsetY) / 10] = 0;
                blocks[b].mini.splice(m, 1);

                if (blocks[b].mini.length == 0) {
                    blocks.splice(b, 1);
                    b--;
                }

                m--;
                playClickSound2();
                await sleep(80);
            }
        }
    }

    for (let i = 0; i < 10; i++) {
        filled[x][i] = 0;
    }
}

async function destroyRow(y) {
    for (let b = 0; b < blocks.length; b++) {
        console.log(blocks[b], b, blocks.length)
        for (let m = 0; m < blocks[b].mini.length; m++) {
            if ((blocks[b].y + blocks[b].mini[m].offsetY) / 10 == y) {
                filled[(blocks[b].x + blocks[b].mini[m].offsetX) / 10][(blocks[b].y + blocks[b].mini[m].offsetY) / 10] = 0;
                blocks[b].mini.splice(m, 1);

                m--;
                playClickSound2();
                await sleep(80);
            }
        }
    }

    for (let i = 0; i < 10; i++) {
        filled[i][y] = 0;
    }
}

function checkOverlapX(block, x) {
    let minis = block.mini;

    for (let i = 0; i < minis.length; i++) {
        if (x + minis[i].offsetX < 0) {
            return true;
        }
        if (x + minis[i].offsetX >= 80) {
            return true;
        }
    }
}

function checkOverlapY(block, y) {
    let minis = block.mini;

    for (let i = 0; i < minis.length; i++) {
        if (y + minis[i].offsetY < 0) {
            return true;
        }
        if (y + minis[i].offsetY >= 80) {
            return true;
        }
    }
}

function addBlock(type, x, y, id) {
    let color = parseInt(Math.random() * colors.length);
    let tempBlock = new ParentBlock(x, y, color, id);

    let miniBlocks = [];

    switch (type) {
        case 0:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            break;
        //I
        case 1:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 30));
            break;
        // I rotated
        case 2:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 30, 0));
            break;

        // 3 x 3
        case 3:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 20));
            break;

        // 2 x 2
        case 4:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            break;

        // L vertical
        case 5:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 20));
            break;
        case 6:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            break;
        case 7:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            break;
        case 8:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 20));
            break;

        // L horizontal
        case 9:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 10));
            break;
        case 10:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            break;
        case 11:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            break;
        case 12:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 10));
            break;

        // Horizontal noodles
        case 13:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 10));
            break;
        case 14:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            break;
        // Vertical noodles
        case 15:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 20));
            break;
        case 16:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            break;
        //Verical pipes
        case 17:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            break;
        case 18:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 20));
            break;
        // Horizontal pipes
        case 19:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            break;
        case 20:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 10));
            break;

        // 3 x 3
        case 21:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 20));
            break;

        // 2 x 2
        case 22:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            break;

        // 3 x 3
        case 23:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 20));
            break;

        // 2 x 2
        case 24:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            break;

        // 1 x 1
        case 25:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            break;

        // 1 x 2
        case 26:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            break;

        // 2 x 1
        case 27:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            break;

        //I
        case 28:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 30));
            break;
        // I rotated
        case 29:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 30, 0));
            break;

        //I
        case 30:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 30));
            break;
        // I rotated
        case 31:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 30, 0));
            break;

        // 1 x 3
        case 32:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 20));
            break;

        // 3 x 1
        case 33:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 20, 0));

        // Corners
        case 34:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            break;

        case 35:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            break;

        case 36:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            break;

        case 37:
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 0));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 0, 10));
            miniBlocks.push(new MiniBlock(tempBlock, ctx, 10, 0));

        default:
            break;
    }

    tempBlock.addMini(miniBlocks);
    blocks.push(tempBlock);
}

addBlock(parseInt(Math.random() * blockSelection) + 1, 5, 320, 0); // Adjust the y value to 320
addBlock(parseInt(Math.random() * blockSelection) + 1, 45, 320, 1); // Adjust the y value to 320
addBlock(parseInt(Math.random() * blockSelection) + 1, 85, 320, 2); // Adjust the y value to 320

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
document.querySelector(".game-settings").onclick = function() {
    let settings = document.createElement("div");
    settings.id = "setting-popup";
    settings.innerHTML = `
    <div class="settings-header">
        <text>Settings</text>
        <button>X</button>
    </div>
    <div class="settings-section">
         <div class="settings-option">
        <div class="toggle-container">
            <span>
                <svg fill="#fff" viewBox="0 0 24 24" id="sound-min" xmlns="http://www.w3.org/2000/svg" class="icon flat-color">
                    <path d="M17.54,16.54a1,1,0,0,1-.71-.3,1,1,0,0,1,0-1.41,4,4,0,0,0,0-5.66,1,1,0,1,1,1.41-1.41,6,6,0,0,1,0,8.48A1,1,0,0,1,17.54,16.54Z" style="fill: #fff;"></path>
                    <path d="M13.38,4.08a1,1,0,0,0-1.09.21L8.59,8H6a2,2,0,0,0-2,2v4a2,2,0,0,0,2,2H8.59l3.7,3.71A1,1,0,0,0,13,20a.84.84,0,0,0,.38-.08A1,1,0,0,0,14,19V5A1,1,0,0,0,13.38,4.08Z" style="fill: #fff;"></path>
                </svg>
                Sound
            </span>
            <label class="toggle">
                <input type="checkbox">
                <span class="toggle-slider"></span>
            </label>
        </div>
    </div>
        <div class="settings-option">
            <div class="toggle-container">
                <span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10.0909 11.9629L19.3636 8.63087V14.1707C18.8126 13.8538 18.1574 13.67 17.4545 13.67C15.4964 13.67 13.9091 15.096 13.9091 16.855C13.9091 18.614 15.4964 20.04 17.4545 20.04C19.4126 20.04 21 18.614 21 16.855C21 16.855 21 16.8551 21 16.855L21 7.49236C21 6.37238 21 5.4331 20.9123 4.68472C20.8999 4.57895 20.8852 4.4738 20.869 4.37569C20.7845 3.86441 20.6352 3.38745 20.347 2.98917C20.2028 2.79002 20.024 2.61055 19.8012 2.45628C19.7594 2.42736 19.716 2.39932 19.6711 2.3722L19.6621 2.36679C18.8906 1.90553 18.0233 1.93852 17.1298 2.14305C16.2657 2.34086 15.1944 2.74368 13.8808 3.23763L11.5963 4.09656C10.9806 4.32806 10.4589 4.52419 10.0494 4.72734C9.61376 4.94348 9.23849 5.1984 8.95707 5.57828C8.67564 5.95817 8.55876 6.36756 8.50501 6.81203C8.4545 7.22978 8.45452 7.7378 8.45455 8.33743V16.1307C7.90347 15.8138 7.24835 15.63 6.54545 15.63C4.58735 15.63 3 17.056 3 18.815C3 20.574 4.58735 22 6.54545 22C8.50355 22 10.0909 20.574 10.0909 18.815C10.0909 18.815 10.0909 18.8151 10.0909 18.815L10.0909 11.9629Z" fill="#ffffff"></path> </g></svg>
                BGM</span>
                <label class="toggle">
                    <input type="checkbox">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
        <div class="settings-option">
           <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.5 20V11H3L12 5L21 11H17.5V20H14.5V16.5C14.5 15.6716 13.8284 15 13 15H11C10.1716 15 9.5 15.6716 9.5 16.5V20H6.5Z" fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        Home <button>Back</button>
        </div>
        <div class="settings-option">
        <svg height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 29.963 29.963" xml:space="preserve" fill="#fff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path style="fill:#ffffff;" d="M29.133,9.215c-0.775-0.428-1.751-0.146-2.178,0.63l-0.518,0.937 c-1.772-5.424-6.874-9.356-12.882-9.356C6.081,1.426,0,7.507,0,14.981s6.081,13.555,13.555,13.555 c0.886,0,1.604-0.718,1.604-1.603c0-0.885-0.718-1.603-1.604-1.603c-5.706,0-10.349-4.643-10.349-10.35S7.849,4.632,13.555,4.632 c4.525,0,8.372,2.924,9.775,6.978l-0.876-0.483c-0.775-0.428-1.751-0.147-2.178,0.629c-0.428,0.776-0.147,1.751,0.629,2.178 l3.169,1.748c0.261,0.531,0.801,0.901,1.434,0.901c0.16,0,0.311-0.031,0.456-0.074c0.009,0,0.016,0.003,0.025,0.003 c0.565,0,1.112-0.298,1.406-0.829l2.368-4.292C30.191,10.618,29.909,9.643,29.133,9.215z"></path> </g> </g> </g></svg>
            Replay <button>Play</button>
        </div>
        <div class="settings-option">
          <svg fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M10.5,2h-4a1,1,0,0,0-1,1V8h6V3A1,1,0,0,0,10.5,2Z"></path><path d="M5.5,14a1,1,0,0,0,1,1h5V9h-6Z"></path><path d="M17.5,9h-5v6h6V10A1,1,0,0,0,17.5,9Z"></path><path d="M12.5,21a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V16h-6Z"></path></g></svg>
        More Games <button>Start</button>
        </div>
        <div class="settings-option">
        <svg height="200px" width="200px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#fff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#ffffff;} </style> <g> <path class="st0" d="M277.028,262.753l-26.612-2.882c-3.641-0.394-6.72-2.788-8.118-6.172c-0.017-0.04-0.034-0.081-0.05-0.121 c-1.403-3.383-0.92-7.252,1.376-10.105l16.78-20.855c3.164-3.932,2.857-9.616-0.712-13.185l-31.411-31.411 c-3.569-3.569-9.252-3.876-13.185-0.712l-20.864,16.787c-2.846,2.29-6.704,2.776-10.082,1.386c-0.037-0.015-0.074-0.03-0.111-0.045 c-3.396-1.394-5.799-4.478-6.194-8.128l-2.883-26.624c-0.543-5.018-4.779-8.82-9.826-8.82h-44.422c-5.047,0-9.283,3.802-9.826,8.82 l-2.883,26.624c-0.395,3.649-2.799,6.734-6.195,8.128c-0.037,0.015-0.074,0.03-0.11,0.045c-3.378,1.391-7.236,0.904-10.082-1.386 L70.752,177.31c-3.932-3.164-9.616-2.857-13.184,0.712l-31.411,31.411c-3.569,3.569-3.876,9.253-0.712,13.185l16.78,20.855 c2.296,2.854,2.779,6.722,1.376,10.105c-0.017,0.04-0.033,0.081-0.05,0.121c-1.399,3.384-4.477,5.778-8.118,6.172L8.82,262.753 C3.802,263.296,0,267.532,0,272.579v44.422c0,5.047,3.802,9.283,8.82,9.826l26.612,2.881c3.641,0.394,6.72,2.788,8.118,6.172 c0.017,0.04,0.033,0.081,0.05,0.121c1.403,3.383,0.92,7.252-1.376,10.106l-16.78,20.855c-3.164,3.932-2.857,9.616,0.712,13.185 l31.411,31.411c3.569,3.569,9.253,3.876,13.185,0.712l20.864-16.787c2.846-2.291,6.704-2.777,10.082-1.386 c0.037,0.015,0.074,0.03,0.111,0.045c3.396,1.394,5.799,4.478,6.194,8.128l2.883,26.624c0.543,5.018,4.779,8.82,9.826,8.82h44.422 c5.047,0,9.283-3.802,9.826-8.82l2.883-26.624c0.395-3.649,2.798-6.734,6.194-8.128c0.037-0.015,0.074-0.03,0.11-0.045 c3.378-1.391,7.236-0.905,10.083,1.386l20.864,16.787c3.932,3.164,9.616,2.857,13.185-0.712l31.411-31.411 c3.569-3.569,3.875-9.253,0.712-13.185l-16.78-20.855c-2.296-2.853-2.779-6.722-1.376-10.106c0.016-0.04,0.033-0.08,0.05-0.121 c1.399-3.384,4.477-5.778,8.118-6.172l26.612-2.881c5.017-0.544,8.82-4.78,8.82-9.826v-44.422 C285.848,267.532,282.046,263.296,277.028,262.753z M142.924,339.349c-24.609,0-44.559-19.95-44.559-44.559 c0-24.609,19.95-44.559,44.559-44.559s44.559,19.95,44.559,44.559C187.483,319.399,167.533,339.349,142.924,339.349z"></path> <path class="st0" d="M507.469,218.212L489.2,203.785c-2.91-2.298-4.526-5.821-4.528-9.53c0-0.039,0-0.078,0-0.118 c-0.006-3.717,1.611-7.249,4.528-9.552l18.269-14.428c4.184-3.304,5.664-8.985,3.624-13.91l-8.025-19.374 c-2.04-4.926-7.104-7.896-12.398-7.274l-23.12,2.716c-3.692,0.434-7.333-0.92-9.956-3.553c-0.027-0.028-0.055-0.056-0.083-0.083 c-2.622-2.624-3.97-6.258-3.537-9.941l2.716-23.119c0.622-5.294-2.349-10.358-7.274-12.398l-19.374-8.024 c-4.925-2.04-10.606-0.56-13.91,3.623l-14.428,18.268c-2.299,2.911-5.822,4.526-9.53,4.528c-0.04,0-0.079,0-0.118,0 c-3.716,0.006-7.248-1.611-9.552-4.528l-14.428-18.269c-3.304-4.184-8.986-5.664-13.911-3.624l-19.374,8.025 c-4.925,2.04-7.896,7.104-7.274,12.399l2.716,23.12c0.434,3.691-0.92,7.332-3.553,9.956c-0.028,0.028-0.056,0.056-0.084,0.084 c-2.624,2.622-6.257,3.97-9.941,3.537l-23.119-2.716c-5.295-0.622-10.358,2.349-12.398,7.274l-8.025,19.374 c-2.04,4.925-0.56,10.607,3.624,13.911l18.268,14.427c2.911,2.299,4.526,5.821,4.528,9.53c0,0.04,0,0.079,0,0.118 c0.007,3.717-1.611,7.249-4.528,9.552l-18.269,14.428c-4.184,3.304-5.664,8.985-3.623,13.91l8.024,19.374 c2.04,4.925,7.104,7.896,12.398,7.274l23.121-2.716c3.691-0.434,7.332,0.92,9.956,3.553c0.028,0.028,0.055,0.056,0.083,0.083 c2.622,2.624,3.97,6.257,3.537,9.941l-2.716,23.12c-0.622,5.295,2.349,10.358,7.274,12.398l19.374,8.025 c4.925,2.04,10.606,0.56,13.911-3.624l14.427-18.268c2.299-2.911,5.821-4.526,9.53-4.528c0.039,0,0.078,0,0.118,0 c3.716-0.007,7.249,1.611,9.552,4.528l14.428,18.269c3.304,4.184,8.985,5.664,13.911,3.624l19.374-8.025 c4.925-2.04,7.896-7.104,7.274-12.398l-2.716-23.12c-0.434-3.691,0.92-7.333,3.553-9.956c0.028-0.028,0.056-0.056,0.084-0.083 c2.624-2.621,6.257-3.97,9.941-3.537l23.12,2.716c5.295,0.622,10.358-2.349,12.398-7.274l8.025-19.374 C513.132,227.198,511.653,221.516,507.469,218.212z M403.948,228.701c-18.584,7.698-39.89-1.127-47.588-19.712 s1.128-39.89,19.712-47.588c18.584-7.698,39.89,1.127,47.588,19.712C431.357,199.697,422.532,221.004,403.948,228.701z"></path> </g> </g></svg>
            More Settings <button>Set</button>
        </div>
    </div>`;
    document.body.appendChild(settings);
 }
