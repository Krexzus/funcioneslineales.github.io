// Variables globales para el canvas
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let scale = 20; // Píxeles por unidad
let showGridLines = true;

// Configuración inicial
function initCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    canvas.style.background = isDarkMode ? '#1e293b' : '#ffffff';
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1, -1);
}

// Dibujar la cuadrícula
function drawGrid() {
    if (!showGridLines) return;

    const width = canvas.width;
    const height = canvas.height;
    const xStart = -width / 2;
    const xEnd = width / 2;
    const yStart = -height / 2;
    const yEnd = height / 2;

    // Obtener el tema actual
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-line-color').trim();
    const axisColor = getComputedStyle(document.documentElement).getPropertyValue('--axis-color').trim();
    const numberColor = getComputedStyle(document.documentElement).getPropertyValue('--number-color').trim();

    ctx.beginPath();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;

    // Líneas verticales
    for (let x = xStart; x <= xEnd; x += scale) {
        ctx.moveTo(x, yStart);
        ctx.lineTo(x, yEnd);
    }

    // Líneas horizontales
    for (let y = yStart; y <= yEnd; y += scale) {
        ctx.moveTo(xStart, y);
        ctx.lineTo(xEnd, y);
    }

    ctx.stroke();

    // Ejes principales
    ctx.beginPath();
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    
    // Eje X
    ctx.moveTo(xStart, 0);
    ctx.lineTo(xEnd, 0);
    
    // Eje Y
    ctx.moveTo(0, yStart);
    ctx.lineTo(0, yEnd);
    
    ctx.stroke();

    // Números en los ejes
    ctx.scale(1, -1); // Invertir para escribir texto
    ctx.font = '12px Arial';
    ctx.fillStyle = numberColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Números en eje X
    for (let x = -10; x <= 10; x++) {
        if (x !== 0) {
            ctx.fillText(x.toString(), x * scale, 15);
        }
    }

    // Números en eje Y
    for (let y = -10; y <= 10; y++) {
        if (y !== 0) {
            ctx.fillText((-y).toString(), -15, y * scale);
        }
    }

    ctx.scale(1, -1); // Restaurar escala
}

// Dibujar la línea
function drawLine() {
    clearGraph();
    
    const a = parseFloat(document.getElementById('a').value);
    const b = parseFloat(document.getElementById('b').value);

    if (isNaN(a)) {
        alert('Por favor, ingrese un valor numérico válido para la pendiente (a)');
        return;
    }

    if (isNaN(b)) {
        alert('Por favor, ingrese un valor numérico válido para la intersección (b)');
        return;
    }

    const width = canvas.width;
    const xStart = -width / (2 * scale);
    const xEnd = width / (2 * scale);

    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;

    // Calcular puntos
    const x1 = xStart;
    const y1 = a * x1 + b;
    const x2 = xEnd;
    const y2 = a * x2 + b;

    // Dibujar línea
    ctx.moveTo(x1 * scale, y1 * scale);
    ctx.lineTo(x2 * scale, y2 * scale);
    ctx.stroke();

    // Mostrar ecuación
    mostrarProcedimiento(a, b);
}

// Limpiar el gráfico
function clearGraph() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    drawGrid();
}

// Calcular Y para un valor de X
function calculateY() {
    const a = parseFloat(document.getElementById('a').value);
    const b = parseFloat(document.getElementById('b').value);
    const x = parseFloat(document.getElementById('x-value').value);

    if (isNaN(x)) {
        alert('Por favor, ingrese un valor numérico válido para X');
        return;
    }

    const y = a * x + b;
    
    // Mostrar procedimiento detallado
    let procedimiento = '<div class="procedimiento-container">';
    
    // Ecuación general
    procedimiento += '<div class="procedimiento-seccion">';
    procedimiento += '<h4>Ecuación de la Recta</h4>';
    procedimiento += `<div class="formula">y = ${a}x ${b >= 0 ? '+' : ''} ${b}</div>`;
    procedimiento += '</div>';

    // Sustitución
    procedimiento += '<div class="procedimiento-seccion">';
    procedimiento += '<h4>Sustitución del Valor de X</h4>';
    procedimiento += `<p>Sustituimos x = ${x} en la ecuación:</p>`;
    procedimiento += `<div class="formula">y = ${a}(${x}) ${b >= 0 ? '+' : ''} ${b}</div>`;
    procedimiento += '</div>';

    // Operaciones
    procedimiento += '<div class="procedimiento-seccion">';
    procedimiento += '<h4>Desarrollo del Cálculo</h4>';
    procedimiento += '<ol class="calculo-steps">';
    
    // Paso 1: Multiplicación
    const multiplicacion = a * x;
    procedimiento += `<li>Multiplicamos: ${a} × ${x} = ${multiplicacion.toFixed(2)}</li>`;
    
    // Paso 2: Suma o resta
    procedimiento += `<li>Sumamos el término independiente: ${multiplicacion.toFixed(2)} ${b >= 0 ? '+' : ''} ${b} = ${y.toFixed(2)}</li>`;
    procedimiento += '</ol>';
    procedimiento += '</div>';

    // Resultado final
    procedimiento += '<div class="procedimiento-seccion">';
    procedimiento += '<h4>Resultado Final</h4>';
    procedimiento += `<div class="formula resultado-final">Para x = ${x}, y = ${y.toFixed(2)}</div>`;
    
    // Interpretación del punto
    procedimiento += '<div class="interpretacion">';
    procedimiento += `<p>→ El punto (${x}, ${y.toFixed(2)}) pertenece a la recta.</p>`;
    if (x === 0) {
        procedimiento += '<p>→ Este punto está sobre el eje Y (es el punto de intersección).</p>';
    } else if (y === 0) {
        procedimiento += '<p>→ Este punto está sobre el eje X (es un cero de la función).</p>';
    }
    if (a > 0) {
        procedimiento += `<p>→ Como la pendiente es positiva, la recta es creciente en este punto.</p>`;
    } else if (a < 0) {
        procedimiento += `<p>→ Como la pendiente es negativa, la recta es decreciente en este punto.</p>`;
    }
    procedimiento += '</div>';
    procedimiento += '</div>';

    procedimiento += '</div>';

    // Actualizar el resultado y marcar el punto
    document.getElementById('resultado').innerHTML = procedimiento;

    // Marcar el punto en el gráfico con animación
    ctx.beginPath();
    ctx.fillStyle = '#ef4444';
    ctx.arc(x * scale, y * scale, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Añadir efecto de destello
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.arc(x * scale, y * scale, 8, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Dibujar líneas punteadas a los ejes
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x * scale, 0);
    ctx.lineTo(x * scale, y * scale);
    ctx.lineTo(0, y * scale);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
}

// Mostrar procedimiento
function mostrarProcedimiento(a, b) {
    const procedimiento = document.getElementById('procedimiento');
    let html = '<div class="procedimiento-container">';
    
    // Título y ecuación general
    html += '<div class="procedimiento-seccion">';
    html += '<h4>Ecuación de la Recta</h4>';
    html += `<div class="formula">y = ${a}x ${b >= 0 ? '+' : ''} ${b}</div>`;
    html += '</div>';

    // Análisis de la pendiente
    html += '<div class="procedimiento-seccion">';
    html += '<h4>Análisis de la Pendiente (a)</h4>';
    html += `<p>a = ${a}</p>`;
    if (a === 0) {
        html += '<p>→ La pendiente es 0, por lo que es una línea horizontal paralela al eje X.</p>';
        html += '<p>→ La función es constante, el valor de y siempre será ' + b + '.</p>';
    } else {
        html += `<p>→ Por cada unidad que aumenta x, y ${Math.abs(a) === 1 ? '' : 'se multiplica por ' + Math.abs(a) + ' y'} ${a > 0 ? 'aumenta' : 'disminuye'}.</p>`;
        html += `<p>→ La función es ${a > 0 ? 'creciente' : 'decreciente'}.</p>`;
        html += `<p>→ El ángulo de inclinación es de ${Math.abs(Math.atan(a) * (180/Math.PI)).toFixed(2)}°.</p>`;
    }
    html += '</div>';

    // Análisis de la intersección
    html += '<div class="procedimiento-seccion">';
    html += '<h4>Análisis de la Intersección (b)</h4>';
    html += `<p>b = ${b}</p>`;
    html += `<p>→ La recta corta al eje Y en el punto (0, ${b}).</p>`;
    if (a !== 0) {
        const xIntersect = -b/a;
        html += `<p>→ La recta corta al eje X en el punto (${xIntersect.toFixed(2)}, 0).</p>`;
    }
    html += '</div>';

    // Puntos notables
    html += '<div class="procedimiento-seccion">';
    html += '<h4>Puntos Notables</h4>';
    html += '<ul>';
    html += `<li>Punto de intersección con eje Y: (0, ${b})</li>`;
    if (a !== 0) {
        const xIntersect = -b/a;
        html += `<li>Punto de intersección con eje X: (${xIntersect.toFixed(2)}, 0)</li>`;
    }
    html += '</ul>';
    html += '</div>';

    // Propiedades adicionales
    html += '<div class="procedimiento-seccion">';
    html += '<h4>Propiedades Adicionales</h4>';
    html += '<ul>';
    if (a !== 0) {
        html += `<li>La recta es ${Math.abs(a) === 1 ? '' : Math.abs(a) + ' veces más '} ${a > 0 ? 'empinada hacia arriba' : 'empinada hacia abajo'} que la función y = x.</li>`;
        html += `<li>Por cada ${a > 0 ? 'incremento' : 'decremento'} de 1 unidad en x, y ${Math.abs(a) === 1 ? 'cambia' : 'cambia ' + Math.abs(a)} unidades.</li>`;
    }
    html += `<li>La función es ${a === 0 ? 'constante' : a > 0 ? 'estrictamente creciente' : 'estrictamente decreciente'}.</li>`;
    html += `<li>El dominio de la función es ℝ (todos los números reales).</li>`;
    html += `<li>El rango de la función es ${a === 0 ? '{' + b + '}' : 'ℝ (todos los números reales)'}.</li>`;
    html += '</ul>';
    html += '</div>';

    html += '</div>';
    procedimiento.innerHTML = html;
}

// Zoom
function zoomIn() {
    scale *= 1.2;
    drawLine();
}

function zoomOut() {
    scale /= 1.2;
    drawLine();
}

// Toggle cuadrícula
function toggleGrid() {
    showGridLines = document.getElementById('showGrid').checked;
    drawLine();
}

// Cargar ejemplo
function cargarEjemplo(a, b) {
    document.getElementById('a').value = a;
    document.getElementById('b').value = b;
    drawLine();
}

// Inicializar canvas cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    drawGrid();
});

// Función para alternar el modo pantalla completa
function toggleFullscreen() {
    const calculatorGraph = document.querySelector('.calculator-graph');
    const isFullscreen = calculatorGraph.classList.contains('fullscreen');
    
    if (!isFullscreen) {
        calculatorGraph.classList.add('fullscreen');
        // Ajustar el canvas al nuevo tamaño
        setTimeout(() => {
            initCanvas();
            drawGrid();
            if (document.getElementById('a').value && document.getElementById('b').value) {
                drawLine();
            }
        }, 100);
    } else {
        calculatorGraph.classList.remove('fullscreen');
        // Restaurar el canvas a su tamaño original
        setTimeout(() => {
            initCanvas();
            drawGrid();
            if (document.getElementById('a').value && document.getElementById('b').value) {
                drawLine();
            }
        }, 100);
    }
}

// Manejar cambios de tamaño de ventana
window.addEventListener('resize', () => {
    initCanvas();
    drawGrid();
    if (document.getElementById('a').value && document.getElementById('b').value) {
        drawLine();
    }
});
