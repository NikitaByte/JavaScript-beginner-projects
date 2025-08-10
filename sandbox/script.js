/*
    Steps for adding new material:
    - add new button in index.html
    - add new material id - row 20
    - add color for new material - row 35
    - add a tile template for new material - row 48
    - add new case in determineColor func in Tile class - row 126
    - add new case in getDensity func - row 226
    - add new key button - row 356
*/

// === CONSTANTS ===

const AggregateState = {
    SOLID:   0b00100000,
    LIQUID:  0b01000000,
    GASEOUS: 0b10000000
};

const Id = {
    EMPTY: 0b00000000 | AggregateState.SOLID,
    SAND:  0b00000001 | AggregateState.SOLID,
    WATER: 0b00000010 | AggregateState.LIQUID,
    STONE: 0b00000011 | AggregateState.SOLID,
    OIL:   0b00000100 | AggregateState.LIQUID,
    SMOKE: 0b00000101 | AggregateState.GASEOUS
};

const Property = {
    NONE:            0b00000000,
    MOVE_DOWN:       0b00000001,
    MOVE_SIDES:      0b00000010,
    MOVE_DOWN_SIDES: 0b00000100,
    MOVE_UP:         0b00001000
};

const Colors = {
    EMPTY: { h: 0,   s: 0,   l: 0,   a: 0 },
    SAND:  { h: 45,  s: 80,  l: 55,  a: 1 },
    WATER: { h: 200, s: 100, l: 50,  a: 0.8 },
    STONE: { h: 0,   s: 0,   l: 40,  a: 1 },
    OIL:   { h: 45,  s: 90,  l: 40,  a: 0.9 },
    SMOKE: { h: 0,  s: 0,  l: 40,  a: 0.7 }
};

// Masks for bitwise operations
const aggregateMask = 0b11100000;   
const idMask =        0b00011111;
const propertyMask =  0b00000111;

const Tiles = {
    empty: { id: Id.EMPTY, property: Property.NONE },
    sand:  { id: Id.SAND,  property: Property.MOVE_DOWN | Property.MOVE_DOWN_SIDES },
    water: { id: Id.WATER, property: Property.MOVE_DOWN | Property.MOVE_SIDES },
    stone: { id: Id.STONE, property: Property.NONE },
    oil:   { id: Id.OIL,   property: Property.MOVE_DOWN | Property.MOVE_SIDES },
    smoke: { id: Id.SMOKE, property: Property.MOVE_UP },
};



// === GRID CONFIGURATIONS ===

const gridConfig = {
    tileSize: 3,
    gameWidth: 600,
    gameHeight: 400,
    gridWidth: 0,
    gridHeight: 0
};

let grid = [];



// === TILE CLASS ===

class Tile {
    constructor(id = Id.EMPTY, property = Property.NONE) {
        this.id = id;
        this.property = property;
        this.updated = false;
        this.color = this.generateColor();
    }

    update(gridX, gridY) {
        if (this.updated) return;
        
        const moveDown =      (this.property & Property.MOVE_DOWN) !== 0;
        const moveDownSides = (this.property & Property.MOVE_DOWN_SIDES) !== 0;
        const moveSides =     (this.property & Property.MOVE_SIDES) !== 0;
        const moveUp =        (this.property & Property.MOVE_UP) !== 0;

        // For gases — move upwards first
        if (moveUp) {
            // Random step up from 1 to 3 cells
            const riseSteps = Math.floor(Math.random() * 3) + 1; // 1..3
            // Random lateral shift -1, 0, or 1
            const sideShift = Math.floor(Math.random() * 3) - 1; // -1,0,1
    
            let nx = gridX + sideShift;
            let ny = gridY - riseSteps;
    
            // Restrictions on boundaries
            if (ny < 0) ny = 0;
            if (nx < 0) nx = 0;
            if (nx >= gridConfig.gridWidth) nx = gridConfig.gridWidth - 1;
    
            if (isInside(nx, ny) && canCapture(gridX, gridY, nx, ny)) {
                swapTiles(gridX, gridY, nx, ny);
                this.updated = true;
                return;
            }
        
            // If that doesn't work, let's try the classic step up by 1
            nx = gridX;
            ny = gridY - 1;
            if (ny >= 0 && canCapture(gridX, gridY, nx, ny)) {
                swapTiles(gridX, gridY, nx, ny);
                this.updated = true;
                return;
            }
        
            // If the upward movement fails, we allow the gas to “spread” slightly to the sides.
            const directions = Math.random() < 0.5 ? [-1, 1] : [1, -1];
            for (const dir of directions) {
                nx = gridX + dir;
                ny = gridY;
                if (isInside(nx, ny) && canCapture(gridX, gridY, nx, ny)) {
                    swapTiles(gridX, gridY, nx, ny);
                    this.updated = true;
                    return;
                }
            }
        }


        // Then we try to move downwards
        if (moveDown && gridY < gridConfig.gridHeight - 1) {
            if (canCapture(gridX, gridY, gridX, gridY + 1)) {
                swapTiles(gridX, gridY, gridX, gridY + 1);
                this.updated = true;
                return;
            }
        }

        // Then diagonally downwards
        if (moveDownSides && gridY < gridConfig.gridHeight - 1) {
            const directions = Math.random() < 0.5 ? [-1, 1] : [1, -1];
            
            for (const dir of directions) {
                const nx = gridX + dir;
                const ny = gridY + 1;

                if (isInside(nx, ny) && canCapture(gridX, gridY, nx, ny)) {
                    swapTiles(gridX, gridY, nx, ny);
                    this.updated = true;
                    return;
                }
            }
        }

        // Finnaly, to the sides (for liquids)
        if (moveSides) {
            const direction = Math.random() < 0.5 ? -1 : 1;
            const nx = gridX + direction;
            const ny = gridY;
            if (isInside(nx, ny) && canCapture(gridX, gridY, nx, ny)) {
                swapTiles(gridX, gridY, nx, ny);
                this.updated = true;
            }
        }
    }

    determineColor() {
        const baseId = this.id & idMask;
        switch (baseId) {
            case Id.SAND & idMask: return Colors.SAND;
            case Id.WATER & idMask: return Colors.WATER;
            case Id.STONE & idMask: return Colors.STONE;
            case Id.OIL & idMask: return Colors.OIL;
            case Id.SMOKE & idMask: return Colors.SMOKE;
            default: return Colors.EMPTY;
        }
    }
    
    generateColor() {
        const color = this.determineColor();

        if (color.a === 0) {
            return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a})`;
        }

        // Add variation to the color
        const hVariation = (Math.random() - 0.5) * 10;
        const sVariation = (Math.random() - 0.5) * 20;
        const lVariation = (Math.random() - 0.5) * 20;

        const h = Math.max(0, Math.min(360, color.h + hVariation));
        const s = Math.max(0, Math.min(100, color.s + sVariation));
        const l = Math.max(0, Math.min(100, color.l + lVariation));
        const a = color.a;

        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }
}



// === GRID FUNCTIONS ===

function initGrid() {
    gridConfig.gridWidth = Math.floor(gridConfig.gameWidth / gridConfig.tileSize);
    gridConfig.gridHeight = Math.floor(gridConfig.gameHeight / gridConfig.tileSize);

    grid = Array.from({ length: gridConfig.gridHeight }, () =>
        Array.from({ length: gridConfig.gridWidth }, () => new Tile())
    );
}

function isInside(x, y) {
    return x >= 0 && x < gridConfig.gridWidth && y >= 0 && y < gridConfig.gridHeight;
}

function canCapture(x1, y1, x2, y2) {
    if (!isInside(x2, y2)) return false;
            
    const tile1 = grid[y1][x1];
    const tile2 = grid[y2][x2];
    const density1 = getDensity(tile1);
    const density2 = getDensity(tile2);

    // Empty cells can be captured by anything
    if ((tile2.id & idMask) === (Id.EMPTY & idMask)) return true;

    // Solid-solid interactions
    if (isSolid(x1, y1) && isSolid(x2, y2)) {
        // Sands and other granular solids can fall through liquids based on density
        if (isLiquid(x2, y2)) {
            // Heavy solids fall through liquids, light ones float, equal density suspend
            if (density1 > density2) return true;  // Fall through
            if (density1 === density2) return Math.random() < 0.1; // Sometimes move (suspension)
            return false; // Float on surface
        }
        // Regular solids cannot capture each other (except through liquids)
        return false;
    }

    // Solid-liquid interactions
    if (isSolid(x1, y1) && isLiquid(x2, y2)) {
        // Heavy solids fall through liquids, light ones float, equal density suspend
        if (density1 > density2) return true;  // Fall through
        if (density1 === density2) return Math.random() < 0.1; // Sometimes move (suspension)
        return false; // Float on surface
    }

    // Liquid-solid interactions
    if (isLiquid(x1, y1) && isSolid(x2, y2)) {
        // Liquids can only displace lighter solids
        return density1 > density2;
    }

    // Liquid-liquid interactions
    if (isLiquid(x1, y1) && isLiquid(x2, y2)) {
        return density1 > density2;
    }

    // Solid-Gas interactions
    if (isSolid(x1, y1) && isGaseous(x2, y2)) {
        return true;
    }

    // Liquid-Gas interactions
    if (isLiquid(x1, y1) && isGaseous(x2, y2)) {
        return true;
    }

    // Gas interactions
    if (isGaseous(x1, y1)) {
        return isGaseous(x2, y2) && density1 > density2;
    }

    return false;
}

function getDensity(tile) {
    const baseId = tile.id & idMask;
    switch (baseId) {
        case Id.STONE & idMask: return 8;
        case Id.SAND & idMask: return 4;
        case Id.WATER & idMask: return 3;
        case Id.OIL & idMask: return 2;
        case Id.SMOKE & idMask: return 1;
        default: return 0;
    }
}

function isSolid(x, y) {
    return (grid[y][x].id & aggregateMask) === AggregateState.SOLID;
}

function isLiquid(x, y) {
    return (grid[y][x].id & aggregateMask) === AggregateState.LIQUID;
}

function isGaseous(x, y) {
    return (grid[y][x].id & aggregateMask) === AggregateState.GASEOUS;
}

function swapTiles(x1, y1, x2, y2) {
    if (!isInside(x1, y1) || !isInside(x2, y2)) return;

    const temp = grid[y1][x1];
    grid[y1][x1] = grid[y2][x2];
    grid[y2][x2] = temp;
}

function setTileAt(tileName, x, y) {
    if (!isInside(x, y)) return;
    const tileTemplate = Tiles[tileName];
    if (tileTemplate) {
        grid[y][x] = new Tile(tileTemplate.id, tileTemplate.property);
    }
}

function resetUpdateFlags() {
    for (let y = 0; y < gridConfig.gridHeight; y++) {
        for (let x = 0; x < gridConfig.gridWidth; x++) {
            grid[y][x].updated = false;
        }
    }
}

let leftToRight = true;

function updateGrid() {
    resetUpdateFlags();
    leftToRight = !leftToRight;
    // Go bottom to the top so falling tiles update correctly
    for (let y = gridConfig.gridHeight - 1; y >= 0; y--) {
        if (leftToRight) {
            for (let x = 0; x < gridConfig.gridWidth; x++) {
                grid[y][x].update(x, y);
            }
        }
        else {
            for (let x = gridConfig.gridWidth - 1; x >= 0; x--) {
                grid[y][x].update(x, y);
            }
        }

    }
}

function drawGrid(ctx) {
    ctx.clearRect(0, 0, gridConfig.gameWidth, gridConfig.gameHeight);
    
    for (let y = 0; y < gridConfig.gridHeight; y++) {
        for (let x = 0; x < gridConfig.gridWidth; x++) {
            const tile = grid[y][x];
            if ((tile.id & idMask) !== (Id.EMPTY & idMask)) {
                ctx.fillStyle = tile.color;
                ctx.fillRect(
                    x * gridConfig.tileSize,
                    y * gridConfig.tileSize,
                    gridConfig.tileSize,
                    gridConfig.tileSize
                );
            }
        }
    }
}

function clearGrid() {
    for (let y = 0; y < gridConfig.gridHeight; y++) {
        for (let x = 0; x < gridConfig.gridWidth; x++) {
            grid[y][x] = new Tile();
        }
    }
}



// === INPUT CONTROL ===
let mouseDown = false;
let eraseMode = false;
let currentMaterial = 'sand';

let brush = {
    size: 5,
    pressure: 1,
};
const MIN_BRUSH_SIZE = 1;
const MAX_BRUSH_SIZE = 10;

function initInput(canvas) {
    canvas.addEventListener("mousedown", (e) => {
        mouseDown = true;
        eraseMode = (e.button === 2); // Right click to erase
        handleMouse(e, canvas);
    });

    canvas.addEventListener("mouseup", () => {
        mouseDown = false;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (mouseDown) {
            handleMouse(e, canvas);
        }
    });

    // Prevent context menu on right click
    canvas.addEventListener("contextmenu", e => e.preventDefault());

    // Keyboard control
    document.addEventListener("keydown", (e) => {
        switch(e.key) {
            case '1': currentMaterial = 'sand'; updateMaterialButtons(); break;
            case '2': currentMaterial = 'water'; updateMaterialButtons(); break;
            case '3': currentMaterial = 'stone'; updateMaterialButtons(); break;
            case '4': currentMaterial = 'oil'; updateMaterialButtons(); break;
            case '5': currentMaterial = 'smoke'; updateMaterialButtons(); break;
            case 'ArrowUp':
                brush.pressure = Math.min(brush.pressure + 0.1, 1);
                updateBrushInfoText();
                break;
            case 'ArrowDown':
                brush.pressure = Math.max(brush.pressure - 0.1, 0.1);
                updateBrushInfoText();
                break;
            case '+':
            case '=':
                brush.size = Math.min(brush.size + 1, MAX_BRUSH_SIZE);
                updateBrushInfoText();
                break;
            case '-':
            case '_':
                brush.size = Math.max(brush.size - 1, MIN_BRUSH_SIZE);
                updateBrushInfoText();
                break;
            case 'r': case 'R': clearGrid(); break;
        }
    });
}

function handleMouse(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridX = Math.floor(mouseX / gridConfig.tileSize);
    const gridY = Math.floor(mouseY / gridConfig.tileSize);

    // Draw with a brush
    for (let dy = -Math.floor(brush.size/2); dy <= Math.floor(brush.size/2); dy++) {
        for (let dx = -Math.floor(brush.size/2); dx <= Math.floor(brush.size/2); dx++) {
            const x = gridX + dx;
            const y = gridY + dy;
            
            if (isInside(x, y)) {
                if (eraseMode) {
                    grid[y][x] = new Tile();
                }
                else if (Math.random() <= brush.pressure) {
                    setTileAt(currentMaterial, x, y);
                }
            }
        }
    }    
}

function updateMaterialButtons() {
    document.querySelectorAll('.material-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.material === currentMaterial);
    });
}

function updateBrushInfoText() {
    brushInfo.textContent = `Brush: size - ${brush.size}, pressure - ${brush.pressure.toFixed(1)}`;
}



// === INITIALIZATION ===

const gameBoard = document.getElementById("gameBoard");
const ctx = gameBoard.getContext("2d");
const brushInfo = document.getElementsByClassName('brush-info')[0];

// Init game systems
initGrid();
initInput(gameBoard);

// Event handlers for buttons
document.querySelectorAll('.material-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentMaterial = btn.dataset.material;
        updateMaterialButtons();
    });
});

document.getElementById('reset-btn').addEventListener('click', clearGrid);



// === GAME LOOP ===
function gameLoop() {
    updateGrid();
    drawGrid(ctx);
    requestAnimationFrame(gameLoop);
}

gameLoop();