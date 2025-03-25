// Variables globales para el canvas
let canvas, ctx;
let scale = 20; // Escala para la cuadrícula
let currentM = 0, currentB = 0; // Variables para almacenar los últimos valores calculados
let isDrawing = false; // Flag para evitar múltiples redibujos simultáneos

// Inicializar el canvas
function initCanvas() {
    if (isDrawing) return; // Evitar múltiples inicializaciones simultáneas
    isDrawing = true;

    try {
        canvas = document.getElementById('graphCanvas');
        ctx = canvas.getContext('2d');
        
        // Ajustar tamaño del canvas
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = Math.max(400, window.innerHeight * 0.4);
        
        // Establecer dimensiones del canvas
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // Limpiar transformaciones anteriores
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Centrar el origen
        ctx.translate(canvas.width/2, canvas.height/2);
        
        // Redibujar la gráfica si hay valores calculados
        if (currentM !== 0 || currentB !== 0) {
            drawGraph(currentM, currentB);
        } else {
            drawGrid();
        }
    } catch (error) {
        console.error('Error al inicializar el canvas:', error);
    } finally {
        isDrawing = false;
    }
}

// Dibujar la cuadrícula
function drawGrid() {
    ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
    
    // Dibujar ejes
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    
    // Eje X
    ctx.moveTo(-canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, 0);
    
    // Eje Y
    ctx.moveTo(0, -canvas.height/2);
    ctx.lineTo(0, canvas.height/2);
    ctx.stroke();
    
    // Dibujar cuadrícula y números
    ctx.beginPath();
    ctx.strokeStyle = '#ddd';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calcular el rango de números para mostrar
    const maxX = Math.floor(canvas.width/(2*scale));
    const maxY = Math.floor(canvas.height/(2*scale));
    
    // Líneas verticales y números en el eje X
    for(let x = -maxX; x <= maxX; x++) {
        // Línea vertical
        ctx.moveTo(x * scale, -canvas.height/2);
        ctx.lineTo(x * scale, canvas.height/2);
        
        // Número en el eje X
        ctx.fillStyle = '#666';
        ctx.fillText(x.toString(), x * scale, 15);
    }
    
    // Líneas horizontales y números en el eje Y
    for(let y = -maxY; y <= maxY; y++) {
        // Línea horizontal
        ctx.moveTo(-canvas.width/2, y * scale);
        ctx.lineTo(canvas.width/2, y * scale);
        
        // Número en el eje Y
        ctx.fillStyle = '#666';
        ctx.fillText((-y).toString(), -15, y * scale);
    }
    
    ctx.stroke();
    
    // Dibujar etiquetas de los ejes
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText('X', canvas.width/2 - 10, 15);
    ctx.fillText('Y', -15, -canvas.height/2 + 20);
}

// Dibujar la gráfica de la función
function drawGraph(m, b) {
    if (isDrawing) return; // Evitar múltiples redibujos simultáneos
    isDrawing = true;

    try {
        // Limpiar y redibujar la cuadrícula
        drawGrid();
        
        // Dibujar la función
        ctx.beginPath();
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        
        // Calcular puntos para dibujar la línea
        const x1 = -canvas.width/(2*scale);
        const x2 = canvas.width/(2*scale);
        const y1 = m * x1 + b;
        const y2 = m * x2 + b;
        
        // Dibujar la línea
        ctx.moveTo(x1 * scale, -y1 * scale);
        ctx.lineTo(x2 * scale, -y2 * scale);
        ctx.stroke();
        
        // Dibujar los puntos de entrada
        ctx.fillStyle = '#FF5722';
        const x1Input = parseFloat(document.getElementById('x1').value);
        const y1Input = parseFloat(document.getElementById('y1').value);
        const x2Input = parseFloat(document.getElementById('x2').value);
        const y2Input = parseFloat(document.getElementById('y2').value);
        
        if (!isNaN(x1Input) && !isNaN(y1Input) && !isNaN(x2Input) && !isNaN(y2Input)) {
            ctx.beginPath();
            ctx.arc(x1Input * scale, -y1Input * scale, 5, 0, 2 * Math.PI);
            ctx.arc(x2Input * scale, -y2Input * scale, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Mostrar coordenadas de los puntos
            ctx.font = '12px Arial';
            ctx.fillStyle = '#FF5722';
            ctx.textAlign = 'left';
            ctx.fillText(`(${x1Input}, ${y1Input})`, x1Input * scale + 10, -y1Input * scale);
            ctx.fillText(`(${x2Input}, ${y2Input})`, x2Input * scale + 10, -y2Input * scale);
        }
    } catch (error) {
        console.error('Error al dibujar la gráfica:', error);
    } finally {
        isDrawing = false;
    }
}

// Función para calcular la función
function calculateFunction() {
    const x1 = parseFloat(document.getElementById('x1').value);
    const y1 = parseFloat(document.getElementById('y1').value);
    const x2 = parseFloat(document.getElementById('x2').value);
    const y2 = parseFloat(document.getElementById('y2').value);

    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        alert('Por favor, ingresa valores numéricos válidos');
        return;
    }

    // Evitar división por cero
    if (x2 - x1 === 0) {
        alert('Los puntos no pueden tener la misma coordenada x');
        return;
    }

    // Calcular pendiente (m)
    const m = (y2 - y1) / (x2 - x1);
    
    // Calcular intersección (b)
    const b = y1 - m * x1;

    // Guardar los valores actuales
    currentM = m;
    currentB = b;

    // Función para formatear números
    function formatNumber(num) {
        return Number.isInteger(num) ? num.toString() : num.toFixed(2);
    }

    // Mostrar la ecuación
    const equation = `y = ${formatNumber(m)}x ${b >= 0 ? '+ ' + formatNumber(b) : '- ' + formatNumber(Math.abs(b))}`;
    document.getElementById('equation').textContent = equation;

    // Mostrar pendiente e intersección
    document.getElementById('slope').textContent = formatNumber(m);
    document.getElementById('intercept').textContent = formatNumber(b);

    // Mostrar el procedimiento
    const procedureSteps = document.getElementById('procedure-steps');
    procedureSteps.innerHTML = `
        <p><strong>1. Identificación de puntos:</strong></p>
        <p>Tenemos dos puntos en el plano cartesiano:</p>
        <p>Punto 1: (${x1}, ${y1})</p>
        <p>Punto 2: (${x2}, ${y2})</p>
        
        <p><strong>2. Cálculo de la pendiente (m):</strong></p>
        <p>La pendiente (m) representa el cambio en y por cada unidad de cambio en x.</p>
        <p>Fórmula: m = (y₂ - y₁) / (x₂ - x₁)</p>
        <p>Donde:</p>
        <p>• y₂ - y₁ = cambio vertical</p>
        <p>• x₂ - x₁ = cambio horizontal</p>
        <p>Sustituyendo valores:</p>
        <p>m = (${y2} - ${y1}) / (${x2} - ${x1})</p>
        <p>m = ${formatNumber(y2 - y1)} / ${formatNumber(x2 - x1)}</p>
        <p>m = ${formatNumber(m)}</p>
        <p>Interpretación de la pendiente:</p>
        <p>• ${m > 0 ? 'La pendiente es positiva, lo que indica que la recta es creciente.' : 
            m < 0 ? 'La pendiente es negativa, lo que indica que la recta es decreciente.' : 
            'La pendiente es cero, lo que indica que la recta es horizontal.'}</p>
        
        <p><strong>3. Cálculo de la intersección (b):</strong></p>
        <p>La intersección (b) es el punto donde la recta corta al eje Y (cuando x = 0).</p>
        <p>Usando la ecuación y = mx + b y el punto 1:</p>
        <p>${y1} = ${formatNumber(m)}(${x1}) + b</p>
        <p>${y1} = ${formatNumber(m * x1)} + b</p>
        <p>Despejando b:</p>
        <p>b = ${y1} - ${formatNumber(m * x1)}</p>
        <p>b = ${formatNumber(b)}</p>
        
        <p><strong>4. Ecuación de la recta:</strong></p>
        <p>La ecuación de una recta en forma pendiente-intersección es:</p>
        <p>y = mx + b</p>
        <p>Donde:</p>
        <p>• m = pendiente</p>
        <p>• b = intersección con el eje Y</p>
        <p>Sustituyendo los valores calculados:</p>
        <p>y = ${formatNumber(m)}x ${b >= 0 ? '+ ' + formatNumber(b) : '- ' + formatNumber(Math.abs(b))}</p>
        
        <p><strong>5. Características de la recta:</strong></p>
        <p>• Pendiente: ${formatNumber(m)}</p>
        <p>• Intersección con Y: ${formatNumber(b)}</p>
        <p>• Puntos por donde pasa: (${x1}, ${y1}) y (${x2}, ${y2})</p>
        <p>• ${Math.abs(m) > 1 ? 'La recta es más inclinada que 45°' : 
            Math.abs(m) < 1 ? 'La recta es menos inclinada que 45°' : 
            'La recta forma un ángulo de 45° con el eje X'}</p>
    `;

    // Dibujar la gráfica
    drawGraph(m, b);
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    drawGrid();
});

// Manejar cambios de tamaño de ventana y orientación
let resizeTimeout;
window.addEventListener('resize', () => {
    // Usar debounce para evitar múltiples llamadas
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initCanvas();
    }, 250);
});

// Manejar cambios de orientación específicamente
window.addEventListener('orientationchange', () => {
    // Pequeño retraso para asegurar que el cambio de orientación se complete
    setTimeout(() => {
        initCanvas();
    }, 100);
});

// Manejar scroll
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (currentM !== 0 || currentB !== 0) {
            drawGraph(currentM, currentB);
        }
    }, 100);
});

// Manejar visibilidad de la página
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && (currentM !== 0 || currentB !== 0)) {
        setTimeout(() => {
            drawGraph(currentM, currentB);
        }, 100);
    }
}); 