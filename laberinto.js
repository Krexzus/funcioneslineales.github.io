/**
 * Laberinto Matemático - Juego educativo sobre funciones lineales
 * Este script implementa un juego de laberinto donde los jugadores deben
 * resolver problemas de funciones lineales para avanzar.
 */

// ======= CONFIGURACIÓN GENERAL =======
// Variables de estado del juego
let gameState = {
    currentScreen: 'intro', // 'intro', 'game', 'pause', 'levelComplete', 'gameComplete'
    currentLevel: 1,
    startTime: null,
    elapsedTime: 0,
    problemsSolved: 0,
    totalProblems: 0,
    wrongAttempts: 0,
    isTimerRunning: false,
    timerInterval: null,
    lives: 3, // Vidas iniciales para el nivel 1
    isGameOver: false
};

// Configuración del jugador
let player = {
    x: 0,
    y: 0,
    direction: 'right', // 'up', 'right', 'down', 'left'
    isMoving: false
};

// Configuración del canvas y laberinto
let mazeConfig = {
    cellSize: 30,
    width: 15,
    height: 15,
    canvas: null,
    ctx: null
};

// Matriz del laberinto actual
let currentMaze = [];

// Tipos de celdas
const CELL_TYPES = {
    WALL: 1,
    PATH: 0,
    DOOR: 2,
    SOLVED_DOOR: 3,
    EXIT: 4,
    START: 5
};

// Funciones generadoras de problemas
function generateLevel1Problem() {
    // Generar números aleatorios para la función f(x) = ax + b
    const a = Math.floor(Math.random() * 5) + 1; // 1 a 5
    const b = Math.floor(Math.random() * 10) - 5; // -5 a 5
    const x = Math.floor(Math.random() * 6) - 2; // -2 a 4
    const result = a * x + b;

    return {
        type: "evaluation",
        statement: `Dada la función f(x) = ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}, calcula f(${x})`,
        answer: result.toString(),
        hint: `Sustituye x = ${x} en la función f(x) = ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`
    };
}

function generateLevel2Problem() {
    // Generar ecuación ax + b = cx + d que siempre tenga una solución entera
    let a, c, solution, b, d;
    
    do {
        // Asegurarnos que a y c sean diferentes para evitar infinitas soluciones
        // y que sean números pequeños y positivos para evitar divisiones complejas
        a = Math.floor(Math.random() * 3) + 1; // 1 a 3
        c = Math.floor(Math.random() * 2); // 0 a 1
    } while (a === c); // Repetir si son iguales
    
    // Generar una solución entera razonable (entre -5 y 5)
    solution = Math.floor(Math.random() * 11) - 5; // -5 a 5
    
    // Generar b de manera que sea un número entero razonable
    b = Math.floor(Math.random() * 11) - 5; // -5 a 5
    
    // Calcular d de manera que la ecuación tenga la solución deseada
    // ax + b = cx + d
    // ax - cx = d - b
    // (a-c)x = d - b
    // d = (a-c)x + b
    d = (a - c) * solution + b;
    
    // Verificar que d sea un número razonable (entre -10 y 10)
    if (d < -10 || d > 10) {
        // Si d es muy grande, regenerar el problema
        return generateLevel2Problem();
    }
    
    // Construir el enunciado de manera más clara
    let leftSide = '';
    let rightSide = '';
    
    // Construir lado izquierdo
    if (a === 1) {
        leftSide = `x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`;
    } else {
        leftSide = `${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`;
    }
    
    // Construir lado derecho
    if (c === 0) {
        rightSide = `${d}`;
    } else if (c === 1) {
        rightSide = `x ${d >= 0 ? '+ ' + d : '- ' + Math.abs(d)}`;
    } else {
        rightSide = `${c}x ${d >= 0 ? '+ ' + d : '- ' + Math.abs(d)}`;
    }

    // La respuesta será siempre un número entero
    const answer = solution.toString();

    return {
        type: "solving",
        statement: `Resuelve la ecuación: ${leftSide} = ${rightSide}`,
        answer: answer,
        hint: "1. Agrupa las variables (términos con x) en un lado\n2. Agrupa los números en el otro lado\n3. Despeja x dividiendo ambos lados"
    };
}

function generateLevel3Problem() {
    // Generar un tipo aleatorio de problema
    const problemType = Math.floor(Math.random() * 5); // 0 a 4

    let statement, answer, hint;

    switch (problemType) {
        case 0: // Calcular pendiente dados dos puntos
            const x1 = Math.floor(Math.random() * 5) - 2; // -2 a 2
            const y1 = Math.floor(Math.random() * 5) - 2; // -2 a 2
            const m = Math.floor(Math.random() * 5) - 2; // -2 a 2
            const x2 = x1 + Math.floor(Math.random() * 3) + 1; // x1 + (1 a 3)
            const y2 = y1 + m * (x2 - x1); // Calcular y2 para que la pendiente sea m

            statement = `Calcula la pendiente de la recta que pasa por (${x1}, ${y1}) y (${x2}, ${y2})`;
            answer = m.toString();
            hint = "Utiliza la fórmula:\n𝑎 = (𝑦2 - 𝑦1)/(𝑥2 - 𝑥1)";
            break;

        case 1: // Calcular pendiente de ecuación general
            const A = Math.floor(Math.random() * 7) - 3; // -3 a 3
            const B = 1; // Siempre 1 para mantener la forma general
            const C = Math.floor(Math.random() * 11) - 5; // -5 a 5
            const sign = Math.random() < 0.5 ? '+' : '-';

            statement = `Si la ecuación de una recta ${A}x ${sign} y ${C >= 0 ? '- ' + C : '+ ' + Math.abs(C)} = 0, ¿Cuál es su pendiente?`;
            answer = A.toString();
            hint = "Utiliza la fórmula:\n𝑎 = -𝐴/𝐵";
            break;

        case 2: // Ecuación de recta horizontal
            const y = Math.floor(Math.random() * 11) - 5; // -5 a 5

            statement = `Ecuación en la forma y = ax + b de una recta horizontal que pasa por (0, ${y})`;
            answer = `y = ${y}`;
            hint = "La pendiente de una recta horizontal es cero";
            break;

        case 3: // Ecuación dados punto y pendiente
            const px = Math.floor(Math.random() * 5) - 2; // -2 a 2
            const py = Math.floor(Math.random() * 5) - 2; // -2 a 2
            const pm = Math.floor(Math.random() * 5) - 2; // -2 a 2
            const pb = py - pm * px; // Calcular b para que la recta pase por el punto

            statement = `Ecuación en la forma y = ax + b de una recta que pasa por (${px}, ${py}) y su pendiente es ${pm}`;

            if (pm === 0) {
                answer = `y = ${py}`;
            } else if (pm === 1 && pb === 0) {
                answer = 'y = x';
            } else if (pm === 1) {
                answer = `y = x ${pb >= 0 ? '+ ' + pb : '- ' + Math.abs(pb)}`;
            } else if (pb === 0) {
                answer = `y = ${pm}x`;
            } else {
                answer = `y = ${pm}x ${pb >= 0 ? '+ ' + pb : '- ' + Math.abs(pb)}`;
            }

            hint = "Utiliza el modelo punto-pendiente:\n𝑦 - 𝑦1 = 𝑚(𝑥 - 𝑥1)";
            break;

        case 4: // Calcular pendiente dados dos puntos (variante)
            const vx1 = Math.floor(Math.random() * 5) - 2; // -2 a 2
            const vy1 = Math.floor(Math.random() * 5) - 2; // -2 a 2
            const vm = Math.floor(Math.random() * 5) - 2; // -2 a 2
            const vx2 = vx1 - Math.floor(Math.random() * 3) - 1; // x1 - (1 a 3)
            const vy2 = vy1 + vm * (vx2 - vx1); // Calcular y2 para que la pendiente sea vm

            statement = `Calcula la pendiente de la recta que pasa por (${vx1}, ${vy1}) y (${vx2}, ${vy2})`;
            answer = vm.toString();
            hint = "Utiliza la fórmula:\n𝑎 = (𝑦2 - 𝑦1)/(𝑥2 - 𝑥1)";
            break;
    }

    return {
        type: "equation",
        statement: statement,
        answer: answer,
        hint: hint
    };
}

// Problemas por nivel
const LEVELS = {
    1: {
        title: "Nivel 1: Evaluación de Funciones",
        description: "Evalúa funciones lineales para avanzar",
        mazeSize: { width: 15, height: 15 },
        generateProblem: generateLevel1Problem
    },
    2: {
        title: "Nivel 2: Ecuaciones Lineales",
        description: "Resuelve ecuaciones lineales para avanzar",
        mazeSize: { width: 17, height: 17 },
        generateProblem: generateLevel2Problem
    },
    3: {
        title: "Nivel 3: Funciones Lineales",
        description: "Encuentra la ecuación de la recta usando el formato y = mx + b. IMPORTANTE: Incluye un espacio después de cada símbolo (y = mx + b)",
        mazeSize: { width: 19, height: 19 },
        generateProblem: generateLevel3Problem
    }
};

// Estado actual del problema
let currentProblem = null;
let solvedDoors = [];

// Agregar al inicio del archivo, junto con las otras variables globales
let usedProblems = new Set();
let currentHintIndex = 0;

// ======= INICIALIZACIÓN =======
// Asegurarse de que el DOM esté cargado antes de iniciar
window.addEventListener('DOMContentLoaded', initGame);

/**
 * Inicializa el juego
 */
function initGame() {
    console.log('Inicializando el juego Laberinto Matemático');
    
    // Inicializar canvas
    mazeConfig.canvas = document.getElementById('maze-canvas');
    if (!mazeConfig.canvas) {
        console.error('Error: No se encontró el elemento canvas');
        return;
    }
    
    mazeConfig.ctx = mazeConfig.canvas.getContext('2d');
    
    // Configurar listeners de eventos
    setupEventListeners();
    
    // Inicializar tema
    initTheme();
    
    // Mostrar pantalla de inicio
    showScreen('intro');
    
    console.log('Juego inicializado correctamente');
}

/**
 * Configura los listeners de eventos para todos los botones
 */
function setupEventListeners() {
    // Eventos de teclado
    document.addEventListener('keydown', handleKeyDown);
    
    // Botones de la pantalla de inicio
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    if (difficultyButtons) {
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                gameState.currentLevel = parseInt(btn.getAttribute('data-level') || '1');
            });
        });
    } else {
        console.error('Error: No se encontraron botones de dificultad');
    }
    
    const startButton = document.getElementById('start-game');
    if (startButton) {
        startButton.addEventListener('click', () => {
            startLevel(gameState.currentLevel);
        });
    } else {
        console.error('Error: No se encontró el botón de inicio');
    }
    
    // Botones de la pantalla de juego
    attachEventIfElementExists('hint-btn', 'click', showHint);
    attachEventIfElementExists('pause-btn', 'click', () => showScreen('pause'));
    attachEventIfElementExists('exit-btn', 'click', () => showScreen('intro'));
    
    // Controles táctiles
    attachEventIfElementExists('up-btn', 'click', () => movePlayer('up'));
    attachEventIfElementExists('left-btn', 'click', () => movePlayer('left'));
    attachEventIfElementExists('right-btn', 'click', () => movePlayer('right'));
    attachEventIfElementExists('down-btn', 'click', () => movePlayer('down'));
    attachEventIfElementExists('action-btn', 'click', interact);
    
    // Pantalla de pausa
    attachEventIfElementExists('resume-btn', 'click', resumeGame);
    attachEventIfElementExists('restart-btn', 'click', () => startLevel(gameState.currentLevel));
    attachEventIfElementExists('main-menu-btn', 'click', () => showScreen('intro'));
    
    // Pantalla de nivel completado
    attachEventIfElementExists('next-level-btn', 'click', startNextLevel);
    attachEventIfElementExists('replay-level-btn', 'click', () => startLevel(gameState.currentLevel));
    attachEventIfElementExists('completion-menu-btn', 'click', () => showScreen('intro'));
    
    // Pantalla de juego completado
    attachEventIfElementExists('play-again-btn', 'click', () => startLevel(1));
    attachEventIfElementExists('complete-menu-btn', 'click', () => showScreen('intro'));
    
    // Modal del problema
    attachEventIfElementExists('check-answer', 'click', checkAnswer);
    attachEventIfElementExists('show-hint', 'click', showProblemHint);
    attachEventIfElementExists('close-modal', 'click', closeModal);
    
    // Toggle de tema
    const gameThemeToggle = document.getElementById('game-theme-toggle');
    const globalThemeToggle = document.getElementById('global-theme-toggle');
    
    function updateThemeIcons(theme) {
        const icon = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        if (gameThemeToggle) {
            gameThemeToggle.querySelector('i').className = icon;
        }
        if (globalThemeToggle) {
            globalThemeToggle.querySelector('i').className = icon;
        }
    }

    if (gameThemeToggle) {
        gameThemeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons(newTheme);
        });
    }

    if (globalThemeToggle) {
        globalThemeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons(newTheme);
        });
    }
    
    // Manejar redimensionamiento de ventana
    window.addEventListener('resize', resizeCanvas);
    
    // Pantalla de Game Over
    const restartGameBtn = document.getElementById('restart-game-btn');
    const gameOverMenuBtn = document.getElementById('game-over-menu-btn');
    
    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', () => {
            startLevel(gameState.currentLevel);
        });
    }
    
    if (gameOverMenuBtn) {
        gameOverMenuBtn.addEventListener('click', () => {
            showScreen('intro');
        });
    }
    
    console.log('Eventos configurados correctamente');
}

/**
 * Función de utilidad para adjuntar un evento a un elemento si existe
 */
function attachEventIfElementExists(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, handler);
    } else {
        console.warn(`Advertencia: No se encontró el elemento #${elementId}`);
    }
}

/**
 * Inicializa el tema (claro/oscuro)
 */
function initTheme() {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    html.setAttribute('data-theme', theme);
    
    // Actualizar iconos de ambos botones
    const icon = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    const gameThemeToggle = document.getElementById('game-theme-toggle');
    const globalThemeToggle = document.getElementById('global-theme-toggle');
    
    if (gameThemeToggle) {
        gameThemeToggle.querySelector('i').className = icon;
    }
    if (globalThemeToggle) {
        globalThemeToggle.querySelector('i').className = icon;
    }
}

/**
 * Alterna entre el tema claro y oscuro
 */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Establecer tema
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Actualizar texto del botón
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = newTheme === 'light' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
    }
    
    // Si estamos en el laberinto, redibujarlo
    if (gameState.currentScreen === 'game') {
        drawMaze();
    }
    
    console.log(`Tema cambiado a: ${newTheme}`);
}

/**
 * Muestra una pantalla específica del juego
 * @param {string} screenName - Nombre de la pantalla a mostrar
 */
function showScreen(screenName) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla solicitada
    gameState.currentScreen = screenName;
    
    switch (screenName) {
        case 'intro':
            document.getElementById('intro-screen').classList.add('active');
            stopTimer();
            break;
        case 'game':
            document.getElementById('game-screen').classList.add('active');
            if (!gameState.isTimerRunning) {
                startTimer();
            }
            break;
        case 'pause':
            document.getElementById('pause-screen').classList.add('active');
            stopTimer();
            break;
        case 'levelComplete':
            document.getElementById('level-complete-screen').classList.add('active');
            updateLevelCompleteStats();
            stopTimer();
            break;
        case 'gameComplete':
            document.getElementById('game-complete-screen').classList.add('active');
            stopTimer();
            break;
        case 'gameOver':
            document.getElementById('game-over-screen').classList.add('active');
            stopTimer();
            break;
    }
}

/**
 * Inicia un nivel específico
 * @param {number} level - Número de nivel a iniciar
 */
function startLevel(level) {
    // Asegurarse de que el nivel esté entre 1 y 3
    level = Math.max(1, Math.min(3, level));
    
    // Configurar estado del juego
    gameState.currentLevel = level;
    gameState.startTime = Date.now();
    gameState.elapsedTime = 0;
    gameState.problemsSolved = 0;
    gameState.wrongAttempts = 0;
    gameState.totalProblems = 5; // Cada nivel tendrá 5 problemas
    gameState.isGameOver = false;
    
    // Actualizar vidas según el nivel
    updateLivesForLevel();
    updateLivesCount();
    
    // Actualizar título del nivel
    const levelTitle = document.getElementById('level-title');
    if (levelTitle) {
        levelTitle.textContent = LEVELS[level].title;
    }
    
    // Actualizar contador de puertas
    const doorsCount = document.getElementById('doors-count');
    if (doorsCount) {
        doorsCount.textContent = `0/${gameState.totalProblems}`;
    }
    
    // Configurar tamaño del laberinto
    mazeConfig.width = LEVELS[level].mazeSize.width;
    mazeConfig.height = LEVELS[level].mazeSize.height;
    
    // Resetear variables de estado
    solvedDoors = [];
    currentProblem = null;
    
    // Generar nuevo laberinto
    generateMaze();
    
    // Ubicar al jugador en la entrada
    placePlayer();
    
    // Mostrar pantalla de juego
    showScreen('game');
    
    // Esperar un momento antes de ajustar el canvas para evitar problemas de zoom
    setTimeout(() => {
        // Configurar canvas y dibujar laberinto
        resizeCanvas();
        drawMaze();
    }, 100);
}

/**
 * Maneja el temporizador del juego
 */
function startTimer() {
    gameState.isTimerRunning = true;
    const startTime = Date.now() - gameState.elapsedTime;
    
    gameState.timerInterval = setInterval(() => {
        gameState.elapsedTime = Date.now() - startTime;
        document.getElementById('timer').textContent = formatTime(gameState.elapsedTime);
    }, 1000);
}

function stopTimer() {
    gameState.isTimerRunning = false;
    clearInterval(gameState.timerInterval);
}

function resumeGame() {
    showScreen('game');
    startTimer();
}

/**
 * Formatea tiempo en milisegundos a formato mm:ss
 * @param {number} timeMs - Tiempo en milisegundos
 * @returns {string} - Tiempo formateado como mm:ss
 */
function formatTime(timeMs) {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Clase para manejar conjuntos disjuntos (Union-Find)
 */
class DisjointSet {
    constructor(size) {
        this.parent = new Array(size);
        this.rank = new Array(size);
        for (let i = 0; i < size; i++) {
            this.parent[i] = i;
            this.rank[i] = 0;
        }
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);
        
        if (rootX === rootY) return false;
        
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
        return true;
    }
}

/**
 * Genera un laberinto usando el algoritmo de Kruskal
 */
function generateMazeKruskal() {
    const width = mazeConfig.width;
    const height = mazeConfig.height;
    
    // Inicializar el laberinto con paredes
    const maze = Array(height).fill().map(() => Array(width).fill(CELL_TYPES.WALL));
    
    // Crear conjunto disjunto
    const ds = new DisjointSet(width * height);
    
    // Crear lista de paredes posibles
    const walls = [];
    
    // Añadir paredes horizontales
    for (let y = 1; y < height - 1; y += 2) {
        for (let x = 1; x < width - 1; x += 2) {
            if (x + 2 < width - 1) {
                walls.push({
                    x: x + 1,
                    y: y,
                    cell1: y * width + x,
                    cell2: y * width + (x + 2)
                });
            }
            if (y + 2 < height - 1) {
                walls.push({
                    x: x,
                    y: y + 1,
                    cell1: y * width + x,
                    cell2: (y + 2) * width + x
                });
            }
        }
    }
    
    // Mezclar las paredes aleatoriamente
    for (let i = walls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [walls[i], walls[j]] = [walls[j], walls[i]];
    }
    
    // Procesar cada pared
    for (const wall of walls) {
        if (ds.union(wall.cell1, wall.cell2)) {
            maze[wall.y][wall.x] = CELL_TYPES.PATH;
        }
    }
    
    // Asegurar que las celdas de camino estén conectadas
    for (let y = 1; y < height - 1; y += 2) {
        for (let x = 1; x < width - 1; x += 2) {
            maze[y][x] = CELL_TYPES.PATH;
        }
    }
    
    // Colocar entrada y salida
    maze[1][1] = CELL_TYPES.START;
    
    return maze;
}

/**
 * Genera un nuevo laberinto
 */
function generateMaze() {
    // Usar el algoritmo de Kruskal para generar el laberinto
    currentMaze = generateMazeKruskal();
    
    // Colocar puertas y salida
    placeDoors();
    placeMazeExit();
    
    // Reiniciar el jugador
    player.x = 1;
    player.y = 1;
    player.direction = 'right';
    
    // Reiniciar estado del juego
    solvedDoors = [];
    gameState.problemsSolved = 0;
    gameState.wrongAttempts = 0;
    
    // Actualizar contador de puertas
    updateDoorsCount();
    
    // Dibujar el laberinto
    drawMaze();
}

/**
 * Verifica si hay un camino válido a través de todas las puertas
 */
function hasValidPathThroughDoors(maze) {
    const visited = Array(mazeConfig.height).fill().map(() => Array(mazeConfig.width).fill(false));
    
    function dfs(x, y) {
        // Si estamos fuera de los límites o ya visitamos esta celda
        if (x < 0 || x >= mazeConfig.width || y < 0 || y >= mazeConfig.height || visited[y][x]) {
            return false;
        }
        
        visited[y][x] = true;
        
        // Si llegamos a la salida
        if (maze[y][x] === CELL_TYPES.EXIT) {
            return true;
        }
        
        // Si es una pared o una puerta cerrada, no podemos pasar
        if (maze[y][x] === CELL_TYPES.WALL || maze[y][x] === CELL_TYPES.DOOR) {
            return false;
        }
        
        // Explorar en todas las direcciones
        return dfs(x + 1, y) || dfs(x - 1, y) || dfs(x, y + 1) || dfs(x, y - 1);
    }
    
    return dfs(1, 1);
}

/**
 * Verifica si hay un camino alternativo que evite una puerta específica
 */
function hasAlternativePathAvoidingDoor(maze, doorX, doorY) {
    const visited = Array(mazeConfig.height).fill().map(() => Array(mazeConfig.width).fill(false));
    
    function dfs(x, y) {
        // Si estamos fuera de los límites o ya visitamos esta celda
        if (x < 0 || x >= mazeConfig.width || y < 0 || y >= mazeConfig.height || visited[y][x]) {
            return false;
        }
        
        visited[y][x] = true;
        
        // Si llegamos a la salida
        if (maze[y][x] === CELL_TYPES.EXIT) {
            return true;
        }
        
        // Si es una pared o una puerta cerrada (excepto la puerta que estamos verificando)
        if (maze[y][x] === CELL_TYPES.WALL || 
            (maze[y][x] === CELL_TYPES.DOOR && (x !== doorX || y !== doorY))) {
            return false;
        }
        
        // Explorar en todas las direcciones
        return dfs(x + 1, y) || dfs(x - 1, y) || dfs(x, y + 1) || dfs(x, y - 1);
    }
    
    return dfs(1, 1);
}

/**
 * Verifica si una posición es válida para colocar una puerta
 */
function isValidDoorPosition(x, y, maze) {
    // Verificar que no esté cerca del inicio o la salida
    if (isNearStart(x, y) || isNearExit(x, y)) {
        return false;
    }
    
    // Verificar que sea un camino válido
    if (maze[y][x] !== CELL_TYPES.PATH) {
        return false;
    }
    
    // Verificar que no esté adyacente a otra puerta
    const adjacentPositions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];
    
    for (const pos of adjacentPositions) {
        const newX = x + pos.dx;
        const newY = y + pos.dy;
        
        if (newX >= 0 && newX < mazeConfig.width && 
            newY >= 0 && newY < mazeConfig.height && 
            maze[newY][newX] === CELL_TYPES.DOOR) {
            return false;
        }
    }
    
    return true;
}

/**
 * Coloca puertas en el laberinto de manera estratégica
 */
function placeDoors() {
    const totalDoors = gameState.totalProblems; // Usar el número fijo de problemas
    let doorsPlaced = 0;
    let attempts = 0;
    const maxAttempts = 1000;
    
    // Crear una copia del laberinto para simular puertas
    const mazeCopy = currentMaze.map(row => [...row]);
    
    // Lista para mantener registro de las puertas colocadas
    const placedDoors = [];
    
    while (doorsPlaced < totalDoors && attempts < maxAttempts) {
        // Generar una posición aleatoria
        const x = 1 + Math.floor(Math.random() * (mazeConfig.width - 2));
        const y = 1 + Math.floor(Math.random() * (mazeConfig.height - 2));
        
        // Verificar si la posición es válida
        if (isValidDoorPosition(x, y, mazeCopy)) {
            // Simular colocar la puerta
            mazeCopy[y][x] = CELL_TYPES.DOOR;
            
            // Verificar que no haya caminos alternativos que eviten esta puerta
            let isNecessary = true;
            
            // Verificar contra todas las puertas colocadas anteriormente
            for (const door of placedDoors) {
                if (hasAlternativePathAvoidingDoor(mazeCopy, door.x, door.y)) {
                    isNecessary = false;
                    break;
                }
            }
            
            // Verificar la puerta actual
            if (isNecessary && !hasAlternativePathAvoidingDoor(mazeCopy, x, y)) {
                // La puerta es necesaria, colocarla
                currentMaze[y][x] = CELL_TYPES.DOOR;
                placedDoors.push({ x, y });
                doorsPlaced++;
            } else {
                // La puerta no es necesaria o crea un camino alternativo
                mazeCopy[y][x] = CELL_TYPES.PATH;
            }
        }
        
        attempts++;
    }
    
    // Si no se pudieron colocar todas las puertas, intentar una última vez con una estrategia más agresiva
    if (doorsPlaced < totalDoors) {
        console.log("No se pudieron colocar todas las puertas, intentando estrategia alternativa...");
        // Aquí podríamos implementar una estrategia alternativa si es necesario
    }
}

/**
 * Coloca la salida del laberinto
 */
function placeMazeExit() {
    const width = mazeConfig.width;
    const height = mazeConfig.height;
    
    // Intentar colocar la salida en una posición lejana a la entrada
    let exitPlaced = false;
    let attempts = 0;
    
    while (!exitPlaced && attempts < 100) {
        // Calcular coordenadas cercanas a la esquina opuesta a la entrada
        const exitX = width - 2 - Math.floor(Math.random() * 3);
        const exitY = height - 2 - Math.floor(Math.random() * 3);
        
        if (exitX > 0 && exitX < width - 1 && exitY > 0 && exitY < height - 1 && 
            currentMaze[exitY][exitX] === CELL_TYPES.PATH &&
            !isNearStart(exitX, exitY)) {
            
            // Verificar que NO haya un camino válido a la salida sin pasar por todas las puertas
            if (!hasValidPathThroughDoors(currentMaze)) {
                currentMaze[exitY][exitX] = CELL_TYPES.EXIT;
                exitPlaced = true;
            }
        }
        
        attempts++;
    }
    
    // Si no se pudo colocar cerca de la esquina, probar cualquier lugar válido
    if (!exitPlaced) {
        for (let y = height - 3; y > 0; y--) {
            for (let x = width - 3; x > 0; x--) {
                if (currentMaze[y][x] === CELL_TYPES.PATH && 
                    !isNearStart(x, y) && 
                    !hasValidPathThroughDoors(currentMaze)) {
                    currentMaze[y][x] = CELL_TYPES.EXIT;
                    return;
                }
            }
        }
    }
}

/**
 * Verifica si una coordenada está cerca de la entrada
 */
function isNearStart(x, y) {
    // Considerar "cerca" como estar a 3 celdas o menos de la entrada
    return Math.abs(x - 1) + Math.abs(y - 1) <= 3;
}

/**
 * Verifica si una coordenada está cerca de la salida
 */
function isNearExit(x, y) {
    // Encontrar la posición de la salida
    for (let ey = 0; ey < mazeConfig.height; ey++) {
        for (let ex = 0; ex < mazeConfig.width; ex++) {
            if (currentMaze[ey][ex] === CELL_TYPES.EXIT) {
                // Considerar "cerca" como estar a 3 celdas o menos de la salida
                return Math.abs(x - ex) + Math.abs(y - ey) <= 3;
            }
        }
    }
    return false;
}

/**
 * Verifica si se puede colocar una puerta en la posición dada
 * sin bloquear completamente el camino
 */
function canPlaceDoorAt(x, y) {
    // Contar cuántos caminos adyacentes hay
    let pathCount = 0;
    
    if (x > 0 && (currentMaze[y][x-1] === CELL_TYPES.PATH || currentMaze[y][x-1] === CELL_TYPES.START)) pathCount++;
    if (x < mazeConfig.width - 1 && (currentMaze[y][x+1] === CELL_TYPES.PATH || currentMaze[y][x+1] === CELL_TYPES.EXIT)) pathCount++;
    if (y > 0 && (currentMaze[y-1][x] === CELL_TYPES.PATH || currentMaze[y-1][x] === CELL_TYPES.START)) pathCount++;
    if (y < mazeConfig.height - 1 && (currentMaze[y+1][x] === CELL_TYPES.PATH || currentMaze[y+1][x] === CELL_TYPES.EXIT)) pathCount++;
    
    // Solo permitir puertas en celdas con más de 1 camino adyacente
    // para evitar bloquear completamente el paso
    return pathCount > 1;
}

/**
 * Coloca al jugador en la posición inicial del laberinto
 */
function placePlayer() {
    // Buscar la entrada del laberinto
    for (let y = 0; y < mazeConfig.height; y++) {
        for (let x = 0; x < mazeConfig.width; x++) {
            if (currentMaze[y][x] === CELL_TYPES.START) {
                player.x = x;
                player.y = y;
                player.direction = 'right';
                return;
            }
        }
    }
    
    // Si no hay entrada, colocar en la esquina superior izquierda
    player.x = 1;
    player.y = 1;
}

// ======= RENDERIZADO DEL LABERINTO =======
/**
 * Ajusta el tamaño del canvas según el laberinto y la ventana
 */
function resizeCanvas() {
    // Obtener el contenedor del laberinto
    const container = document.querySelector('.maze-container');
    if (!container) return;
    
    // Calcular tamaño máximo que puede tener cada celda
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calcular el tamaño de celda basado en el ancho y alto disponible
    const maxCellWidth = Math.floor((containerWidth - 20) / mazeConfig.width);
    const maxCellHeight = Math.floor((containerHeight - 20) / mazeConfig.height);
    
    // Usar el valor más pequeño para mantener las celdas cuadradas
    mazeConfig.cellSize = Math.min(
        Math.max(Math.min(maxCellWidth, maxCellHeight), 20), // No menor a 20px
        40 // No mayor a 40px
    );
    
    // Ajustar tamaño del canvas
    if (mazeConfig.canvas) {
        mazeConfig.canvas.width = mazeConfig.cellSize * mazeConfig.width;
        mazeConfig.canvas.height = mazeConfig.cellSize * mazeConfig.height;
        
        // Redibujar si el juego está activo
        if (gameState.currentScreen === 'game') {
            drawMaze();
        }
    }
}

/**
 * Dibuja el laberinto en el canvas
 */
function drawMaze() {
    const ctx = mazeConfig.ctx;
    const cellSize = mazeConfig.cellSize;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, mazeConfig.canvas.width, mazeConfig.canvas.height);
    
    // Obtener colores del CSS
    const style = getComputedStyle(document.documentElement);
    const wallColor = style.getPropertyValue('--wall-color').trim() || '#4b5563';
    const pathColor = style.getPropertyValue('--path-color').trim() || '#f3f4f6';
    const doorColor = style.getPropertyValue('--door-color').trim() || '#fbbf24';
    const solvedDoorColor = style.getPropertyValue('--solved-door-color').trim() || '#34d399';
    const exitColor = style.getPropertyValue('--exit-color').trim() || '#f87171';
    const playerColor = style.getPropertyValue('--player-color').trim() || '#3b82f6';
    
    // Dibujar cada celda del laberinto
    for (let y = 0; y < mazeConfig.height; y++) {
        for (let x = 0; x < mazeConfig.width; x++) {
            const cellType = currentMaze[y][x];
            const cellX = x * cellSize;
            const cellY = y * cellSize;
            
            switch (cellType) {
                case CELL_TYPES.WALL:
                    ctx.fillStyle = wallColor;
                    ctx.fillRect(cellX, cellY, cellSize, cellSize);
                    break;
                    
                case CELL_TYPES.PATH:
                case CELL_TYPES.START:
                    ctx.fillStyle = pathColor;
                    ctx.fillRect(cellX, cellY, cellSize, cellSize);
                    
                    // Dibujar indicador de inicio si es la entrada
                    if (cellType === CELL_TYPES.START) {
                        ctx.fillStyle = playerColor;
                        ctx.beginPath();
                        ctx.arc(cellX + cellSize/2, cellY + cellSize/2, cellSize/6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;
                    
                case CELL_TYPES.DOOR:
                    ctx.fillStyle = pathColor;
                    ctx.fillRect(cellX, cellY, cellSize, cellSize);
                    
                    // Dibujar puerta
                    ctx.fillStyle = doorColor;
                    const doorSize = cellSize * 0.6;
                    const doorX = cellX + (cellSize - doorSize) / 2;
                    const doorY = cellY + (cellSize - doorSize) / 2;
                    ctx.beginPath();
                    ctx.arc(cellX + cellSize/2, cellY + cellSize/2, doorSize/2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case CELL_TYPES.SOLVED_DOOR:
                    ctx.fillStyle = pathColor;
                    ctx.fillRect(cellX, cellY, cellSize, cellSize);
                    
                    // Dibujar puerta resuelta
                    ctx.fillStyle = solvedDoorColor;
                    const solvedDoorSize = cellSize * 0.6;
                    const solvedDoorX = cellX + (cellSize - solvedDoorSize) / 2;
                    const solvedDoorY = cellY + (cellSize - solvedDoorSize) / 2;
                    ctx.beginPath();
                    ctx.arc(cellX + cellSize/2, cellY + cellSize/2, solvedDoorSize/2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Dibujar check
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(cellX + cellSize * 0.35, cellY + cellSize * 0.5);
                    ctx.lineTo(cellX + cellSize * 0.45, cellY + cellSize * 0.6);
                    ctx.lineTo(cellX + cellSize * 0.65, cellY + cellSize * 0.4);
                    ctx.stroke();
                    break;
                    
                case CELL_TYPES.EXIT:
                    ctx.fillStyle = pathColor;
                    ctx.fillRect(cellX, cellY, cellSize, cellSize);
                    
                    // Dibujar salida
                    ctx.fillStyle = exitColor;
                    // Dibujar bandera
                    ctx.fillRect(cellX + cellSize * 0.3, cellY + cellSize * 0.3, cellSize * 0.1, cellSize * 0.5);
                    ctx.beginPath();
                    ctx.moveTo(cellX + cellSize * 0.4, cellY + cellSize * 0.3);
                    ctx.lineTo(cellX + cellSize * 0.7, cellY + cellSize * 0.4);
                    ctx.lineTo(cellX + cellSize * 0.4, cellY + cellSize * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
        }
    }
    
    // Dibujar jugador
    drawPlayer();
}

/**
 * Dibuja al jugador en el laberinto
 */
function drawPlayer() {
    const ctx = mazeConfig.ctx;
    const cellSize = mazeConfig.cellSize;
    const style = getComputedStyle(document.documentElement);
    const playerColor = style.getPropertyValue('--player-color').trim() || '#3b82f6';
    
    // Calcular posición exacta
    const x = player.x * cellSize + cellSize / 2;
    const y = player.y * cellSize + cellSize / 2;
    const radius = cellSize * 0.35;
    
    // Dibujar cuerpo del jugador
    ctx.fillStyle = playerColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Dibujar dirección del jugador (como un pequeño triángulo)
    const direction = player.direction;
    const dirX = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;
    const dirY = direction === 'down' ? 1 : direction === 'up' ? -1 : 0;
    
    ctx.beginPath();
    ctx.moveTo(x + dirX * radius * 0.6, y + dirY * radius * 0.6);
    ctx.lineTo(x + dirY * radius * 0.4, y - dirX * radius * 0.4);
    ctx.lineTo(x - dirY * radius * 0.4, y + dirX * radius * 0.4);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
}

// ======= MOVIMIENTO DEL JUGADOR =======
/**
 * Maneja eventos de teclado para el movimiento
 * @param {KeyboardEvent} event - Evento de teclado
 */
function handleKeyDown(event) {
    // Solo procesar si estamos en la pantalla de juego
    if (gameState.currentScreen !== 'game') return;
    
    console.log('Tecla presionada:', event.key);
    
    // Manejar diferentes teclas
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            movePlayer('up');
            event.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer('right');
            event.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer('down');
            event.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlayer('left');
            event.preventDefault();
            break;
        case ' ': // Tecla espacio
            console.log('Tecla espacio presionada - intentando interactuar');
            interact();
            event.preventDefault();
            break;
        case 'h':
        case 'H':
            showHint();
            event.preventDefault();
            break;
        case 'p':
        case 'P':
            showScreen('pause');
            event.preventDefault();
            break;
    }
}

/**
 * Mueve al jugador en la dirección especificada
 * @param {string} direction - Dirección de movimiento ('up', 'right', 'down', 'left')
 */
function movePlayer(direction) {
    if (player.isMoving) return;
    
    player.direction = direction;
    drawMaze();
    
    let newX = player.x;
    let newY = player.y;
    
    switch (direction) {
        case 'up': newY--; break;
        case 'right': newX++; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
    }
    
    if (newX >= 0 && newX < mazeConfig.width && newY >= 0 && newY < mazeConfig.height) {
        const targetCell = currentMaze[newY][newX];
        
        if (targetCell === CELL_TYPES.PATH || targetCell === CELL_TYPES.START || targetCell === CELL_TYPES.SOLVED_DOOR) {
            player.x = newX;
            player.y = newY;
            player.isMoving = true;
            
            setTimeout(() => {
                player.isMoving = false;
                drawMaze();
            }, 100);
            
            drawMaze();
        } else if (targetCell === CELL_TYPES.EXIT) {
            // Verificar si todas las puertas han sido resueltas
            if (solvedDoors.length === gameState.totalProblems) {
                player.x = newX;
                player.y = newY;
                drawMaze();
                
                // Mostrar mensaje de éxito y luego la pantalla de nivel completado
                showMessage("¡Nivel completado!", 1500);
                setTimeout(() => {
                    completeLevel();
                }, 1500);
            } else {
                const remainingDoors = gameState.totalProblems - solvedDoors.length;
                showMessage(`¡Debes resolver ${remainingDoors} puerta${remainingDoors !== 1 ? 's' : ''} más antes de salir!`);
            }
        } else if (targetCell === CELL_TYPES.DOOR) {
            showSimpleProblem(newX, newY);
        }
    }
}

/**
 * Función de interacción con elementos del laberinto
 */
function interact() {
    console.log('Intentando interactuar...');
    
    // Determinar la celda frente al jugador
    let targetX = player.x;
    let targetY = player.y;
    
    switch (player.direction) {
        case 'up':
            targetY--;
            break;
        case 'right':
            targetX++;
            break;
        case 'down':
            targetY++;
            break;
        case 'left':
            targetX--;
            break;
    }
    
    // Comprobar límites del laberinto
    if (targetX < 0 || targetX >= mazeConfig.width || targetY < 0 || targetY >= mazeConfig.height) {
        console.log('Fuera de los límites del laberinto');
        return;
    }
    
    // Obtener tipo de celda objetivo
    const targetCell = currentMaze[targetY][targetX];
    console.log(`Interactuando con celda tipo: ${targetCell} en posición (${targetX},${targetY})`);
    
    // Interactuar según el tipo de celda
    if (targetCell === CELL_TYPES.DOOR) {
        // Mostrar problema para abrir puerta
        showSimpleProblem(targetX, targetY);
    } else if (targetCell === CELL_TYPES.EXIT) {
        // Verificar si todas las puertas han sido resueltas
        if (solvedDoors.length === gameState.totalProblems) {
            if (gameState.currentLevel < 3) {
                completeLevel();
            } else {
                completeGame();
            }
        } else {
            const remainingDoors = gameState.totalProblems - solvedDoors.length;
            showMessage(`¡Debes resolver ${remainingDoors} puerta${remainingDoors !== 1 ? 's' : ''} más antes de salir!`);
        }
    } else {
        // No hay nada con qué interactuar
        showMessage("No hay nada con qué interactuar aquí");
    }
}

/**
 * Muestra un problema matemático de forma simplificada
 */
function showSimpleProblem(doorX, doorY) {
    // Verificar si la puerta ya fue resuelta
    const doorIndex = solvedDoors.findIndex(door => door.x === doorX && door.y === doorY);
    if (doorIndex !== -1) {
        currentMaze[doorY][doorX] = CELL_TYPES.SOLVED_DOOR;
        drawMaze();
        return;
    }
    
    // Generar un nuevo problema
    const problem = LEVELS[gameState.currentLevel].generateProblem();
    
    // Guardar problema actual
    currentProblem = {
        ...problem,
        x: doorX,
        y: doorY
    };
    
    // Mostrar alerta con el problema
    const respuesta = prompt(problem.statement + "\n\nEscribe tu respuesta:");
    
    if (respuesta !== null) {
        if (respuesta.trim().toLowerCase() === problem.answer.toLowerCase()) {
            // Respuesta correcta
            alert("¡Correcto! La puerta se ha abierto.");
            
            // Marcar como resuelta
            solvedDoors.push({
                x: doorX,
                y: doorY
            });
            
            // Abrir la puerta
            currentMaze[doorY][doorX] = CELL_TYPES.SOLVED_DOOR;
            gameState.problemsSolved++;
            updateDoorsCount();
            drawMaze();
            
            // Mostrar mensaje
            showMessage("¡Puerta abierta!");
        } else {
            // Respuesta incorrecta
            gameState.lives--;
            gameState.wrongAttempts++;
            updateLivesCount();
            
            if (gameState.lives <= 0) {
                // Game Over
                gameState.isGameOver = true;
                alert("¡Game Over! Te has quedado sin vidas.");
                showGameOver();
            } else {
                alert(`Respuesta incorrecta. Te quedan ${gameState.lives} vidas.`);
            }
        }
    } else {
        // El jugador canceló el problema
        gameState.lives--;
        gameState.wrongAttempts++;
        updateLivesCount();
        
        if (gameState.lives <= 0) {
            // Game Over
            gameState.isGameOver = true;
            alert("¡Game Over! Te has quedado sin vidas.");
            showGameOver();
        } else {
            alert(`Has cancelado el problema. Te quedan ${gameState.lives} vidas.`);
        }
    }
}

// ======= PROBLEMAS MATEMÁTICOS =======

/**
 * Muestra un mensaje temporal en la pantalla
 * @param {string} text - Texto del mensaje a mostrar
 * @param {number} duration - Duración en milisegundos
 */
function showMessage(text, duration = 2000) {
    // Eliminar mensaje anterior si existe
    const existingMessage = document.querySelector('.game-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const message = document.createElement('div');
    message.className = 'game-message';
    message.textContent = text;
    document.querySelector('.maze-container').appendChild(message);
    
    // Eliminar después de la duración
    setTimeout(() => {
        message.classList.add('fade-out');
        setTimeout(() => message.remove(), 500);
    }, duration);
}

// ======= FINALIZACIÓN DE NIVELES =======
/**
 * Actualiza las estadísticas en la pantalla de nivel completado
 */
function updateLevelCompleteStats() {
    // Asegurarse de que el tiempo se detenga antes de mostrar las estadísticas
    stopTimer();
    
    // Actualizar elementos de la pantalla de resumen
    const levelTitle = document.getElementById('completion-level');
    const timeElement = document.getElementById('completion-time');
    const doorsElement = document.getElementById('completion-doors');
    const errorsElement = document.getElementById('completion-errors');
    
    if (levelTitle) levelTitle.textContent = `¡Nivel ${gameState.currentLevel} Completado!`;
    if (timeElement) timeElement.textContent = formatTime(gameState.elapsedTime);
    if (doorsElement) doorsElement.textContent = `${gameState.problemsSolved}/${gameState.totalProblems}`;
    if (errorsElement) errorsElement.textContent = gameState.wrongAttempts;
    
    // Mostrar/ocultar botón de siguiente nivel
    const nextLevelBtn = document.getElementById('next-level-btn');
    if (nextLevelBtn) {
        nextLevelBtn.style.display = gameState.currentLevel >= 3 ? 'none' : 'block';
    }
}

/**
 * Completa el nivel actual
 */
function completeLevel() {
    // Detener el temporizador
    stopTimer();
    
    // Mostrar la pantalla de nivel completado
    showScreen('levelComplete');
    
    // Actualizar estadísticas
    const levelTitle = document.getElementById('completion-level');
    const timeElement = document.getElementById('completion-time');
    const doorsElement = document.getElementById('completion-doors');
    const errorsElement = document.getElementById('completion-errors');
    
    if (levelTitle) levelTitle.textContent = `¡Nivel ${gameState.currentLevel} Completado!`;
    if (timeElement) timeElement.textContent = formatTime(gameState.elapsedTime);
    if (doorsElement) doorsElement.textContent = `${gameState.problemsSolved}/${gameState.totalProblems}`;
    if (errorsElement) errorsElement.textContent = gameState.wrongAttempts;
    
    // Configurar botones
    const nextLevelBtn = document.getElementById('next-level-btn');
    const menuBtn = document.getElementById('completion-menu-btn');
    
    if (nextLevelBtn) {
        // Remover cualquier evento anterior
        nextLevelBtn.replaceWith(nextLevelBtn.cloneNode(true));
        const newNextLevelBtn = document.getElementById('next-level-btn');
        
        if (gameState.currentLevel < 3) {
            newNextLevelBtn.style.display = 'block';
            newNextLevelBtn.addEventListener('click', startNextLevel);
        } else {
            newNextLevelBtn.style.display = 'none';
            completeGame();
        }
    }
    
    if (menuBtn) {
        menuBtn.onclick = () => {
            showScreen('intro');
        };
    }
}

/**
 * Inicia el siguiente nivel
 */
function startNextLevel() {
    console.log('Iniciando siguiente nivel. Nivel actual:', gameState.currentLevel);
    const nextLevel = gameState.currentLevel + 1;
    console.log('Siguiente nivel:', nextLevel);
    
    if (nextLevel <= 3) {
        // Reiniciar el estado del juego para el nuevo nivel
        gameState.problemsSolved = 0;
        gameState.wrongAttempts = 0;
        gameState.lives = 3;
        gameState.startTime = null;
        gameState.elapsedTime = 0;
        gameState.isGameOver = false;
        solvedDoors = [];
        usedProblems.clear();
        
        // Actualizar el nivel actual
        gameState.currentLevel = nextLevel;
        console.log('Nivel actualizado a:', gameState.currentLevel);
        
        // Iniciar el nuevo nivel
        startLevel(nextLevel);
    } else {
        completeGame();
    }
}

/**
 * Completa el juego entero
 */
function completeGame() {
    // Actualizar estadísticas de juego completo
    document.getElementById('game-complete-time').textContent = formatTime(gameState.elapsedTime);
    document.getElementById('game-complete-level').textContent = gameState.currentLevel.toString();
    
    showScreen('gameComplete');
}

/**
 * Muestra una pista para el problema actual
 */
function showProblemHint() {
    if (!currentProblem || !currentProblem.hint) {
        console.log('No hay pista disponible para este problema');
        return;
    }
    
    const feedbackArea = document.getElementById('problem-feedback');
    feedbackArea.innerHTML = `<strong>Pista:</strong> ${currentProblem.hint}`;
    feedbackArea.className = 'problem-feedback hint';
    
    console.log('Mostrando pista:', currentProblem.hint);
}

/**
 * Muestra una pista general del nivel actual
 */
function showHint() {
    let message;
    
    if (gameState.currentLevel === 3) {
        const hints = [
            {
                title: "Fórmula de pendiente entre dos puntos",
                formula: "𝑎 = (𝑦2 - 𝑦1)/(𝑥2 - 𝑥1)",
                explanation: "Usa esta fórmula cuando te den dos puntos por los que pasa la recta"
            },
            {
                title: "Fórmula de pendiente en ecuación general",
                formula: "𝑎 = -𝐴/𝐵",
                explanation: "Usa esta fórmula cuando la ecuación esté en la forma Ax + By + C = 0"
            },
            {
                title: "Recta horizontal",
                formula: "y = b",
                explanation: "La pendiente de una recta horizontal es cero, por lo que la ecuación es y = b"
            },
            {
                title: "Modelo punto-pendiente",
                formula: "𝑦 - 𝑦1 = 𝑚(𝑥 - 𝑥1)",
                explanation: "Usa esta fórmula cuando te den un punto y la pendiente de la recta"
            },
            {
                title: "Forma pendiente-intercepto",
                formula: "y = mx + b",
                explanation: "La forma más común de escribir la ecuación de una recta, donde m es la pendiente y b es el intercepto"
            }
        ];

        // Obtener la pista actual y avanzar al siguiente índice
        const currentHint = hints[currentHintIndex];
        currentHintIndex = (currentHintIndex + 1) % hints.length;

        message = `Pista ${currentHintIndex + 1} de ${hints.length}:\n\n` +
                 `${currentHint.title}\n\n` +
                 `Fórmula:\n${currentHint.formula}\n\n` +
                 `${currentHint.explanation}\n\n` +
                 `Presiona H para ver otra pista.`;
    } else {
        const levelInfo = LEVELS[gameState.currentLevel];
        message = `Consejos para el Nivel ${gameState.currentLevel}:\n\n${levelInfo.description}\n\nBusca las puertas amarillas y resuelve los problemas para avanzar.`;
    }
    
    console.log('Mostrando pista del nivel:', message);
    showMessage(message, 4000);
}

function updateDoorsCount() {
    const doorsCountElement = document.getElementById('doors-count');
    if (doorsCountElement) {
        doorsCountElement.textContent = `${solvedDoors.length}/${gameState.totalProblems}`;
    }
}

/**
 * Verifica si la respuesta es correcta
 */
function checkAnswer() {
    const answerInput = document.getElementById('answer-input');
    const userAnswer = answerInput.value.trim();
    const correctAnswer = currentProblem.answer.trim();
    
    // Normalizar espacios en ambas respuestas
    const normalizedUserAnswer = userAnswer.replace(/\s+/g, '');
    const normalizedCorrectAnswer = correctAnswer.replace(/\s+/g, '');
    
    // Para ecuaciones lineales (nivel 2), verificar si el valor numérico es el mismo
    if (currentProblem.type === "solving") {
        const userValue = parseFloat(normalizedUserAnswer);
        const correctValue = parseFloat(normalizedCorrectAnswer);
        
        if (!isNaN(userValue) && !isNaN(correctValue) && 
            Math.abs(userValue - correctValue) < 0.0001) { // Usar una pequeña tolerancia para comparaciones de punto flotante
            // Respuesta correcta
            showFeedback("¡Correcto!", "success");
            
            // Marcar como resuelta
            solvedDoors.push({
                x: currentProblem.x,
                y: currentProblem.y
            });
            
            // Abrir la puerta
            currentMaze[currentProblem.y][currentProblem.x] = CELL_TYPES.SOLVED_DOOR;
            gameState.problemsSolved++;
            updateDoorsCount();
            drawMaze();
            
            // Cerrar modal después de un breve delay
            setTimeout(() => {
                closeModal();
                showMessage("¡Puerta abierta!");
            }, 1000);
            return;
        }
    }
    
    // Para otros tipos de problemas o si la respuesta no es correcta
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
        // Respuesta correcta
        showFeedback("¡Correcto!", "success");
        
        // Marcar como resuelta
        solvedDoors.push({
            x: currentProblem.x,
            y: currentProblem.y
        });
        
        // Abrir la puerta
        currentMaze[currentProblem.y][currentProblem.x] = CELL_TYPES.SOLVED_DOOR;
        gameState.problemsSolved++;
        updateDoorsCount();
        drawMaze();
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
            closeModal();
            showMessage("¡Puerta abierta!");
        }, 1000);
    } else {
        // Respuesta incorrecta
        gameState.lives--;
        gameState.wrongAttempts++;
        updateLivesCount();
        
        if (gameState.lives <= 0) {
            // Game Over
            gameState.isGameOver = true;
            showFeedback("¡Game Over! Te has quedado sin vidas.", "error");
            setTimeout(() => {
                closeModal();
                showGameOver();
            }, 2000);
        } else {
            showFeedback(`Respuesta incorrecta. Te quedan ${gameState.lives} vidas.`, "error");
        }
    }
}

/**
 * Muestra la pantalla de Game Over
 */
function showGameOver() {
    // Actualizar estadísticas en la pantalla de Game Over
    document.getElementById('game-over-problems').textContent = gameState.problemsSolved;
    document.getElementById('game-over-attempts').textContent = gameState.wrongAttempts;
    
    // Mostrar la pantalla de Game Over
    showScreen('gameOver');
    
    // Detener el temporizador
    stopTimer();
    
    // Configurar event listeners para los botones de Game Over
    const restartGameBtn = document.getElementById('restart-game-btn');
    const gameOverMenuBtn = document.getElementById('game-over-menu-btn');
    
    if (restartGameBtn) {
        restartGameBtn.onclick = () => {
            startLevel(gameState.currentLevel);
        };
    }
    
    if (gameOverMenuBtn) {
        gameOverMenuBtn.onclick = () => {
            showScreen('intro');
        };
    }
}

/**
 * Reinicia el juego
 */
function restartGame() {
    gameState.currentLevel = 1;
    gameState.problemsSolved = 0;
    gameState.wrongAttempts = 0;
    gameState.isGameOver = false;
    updateLivesForLevel();
    updateLivesCount();
    
    // Generar nuevo laberinto
    generateMaze();
    
    // Cerrar modal
    closeModal();
}

/**
 * Actualiza las vidas según el nivel
 */
function updateLivesForLevel() {
    switch(gameState.currentLevel) {
        case 1:
            gameState.lives = 3;
            break;
        case 2:
            gameState.lives = 2;
            break;
        case 3:
            gameState.lives = 1;
            break;
    }
}

/**
 * Actualiza el contador de vidas en la interfaz
 */
function updateLivesCount() {
    const livesCountElement = document.getElementById('lives-count');
    if (livesCountElement) {
        livesCountElement.textContent = gameState.lives;
        // Añadir clase 'low' cuando queden pocas vidas
        if (gameState.lives <= 1) {
            livesCountElement.classList.add('low');
        } else {
            livesCountElement.classList.remove('low');
        }
    }
}
