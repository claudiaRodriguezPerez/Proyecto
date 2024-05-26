document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let startX, startY;
    let lastX, lastY;
    let drawings = [];

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);

    ctx.lineWidth = document.getElementById('lineWidthRange').value;

    // Funciones para cambiar la herramienta
    document.getElementById('circleTool').addEventListener('click', function() {
        selectedTool = 'circle';
    });

    document.getElementById('rectangleTool').addEventListener('click', function() {
        selectedTool = 'rectangle';
    });

    document.getElementById('textTool').addEventListener('click', function() {
        selectedTool = 'text';
    });

    document.getElementById('arrowTool').addEventListener('click', function() {
        selectedTool = 'arrow';
    });

    // Manejar el cambio de colores de los círculos
    document.getElementById('blueButton').addEventListener('click', function() {
        selectedCircleColor = circleColors.azulMarino;
    });

    document.getElementById('orangeButton').addEventListener('click', function() {
        selectedCircleColor = circleColors.naranja;
    });

    // Función para deshacer el último dibujo
    document.getElementById('undoButton').addEventListener('click', function() {
        undoLastDrawing();
    });

    // Función para borrar el dibujo completo con confirmación
    document.getElementById('clearButton').addEventListener('click', function() {
        const confirmDelete = confirm("¿Estás seguro de que quieres borrar todo el dibujo?");
        if (confirmDelete) {
            clearDrawing();
        }
    });

    function startDrawing(e) {
        isDrawing = true;
        startX = e.offsetX;
        startY = e.offsetY;
    }

    function draw(e) {
        if (!isDrawing || selectedTool === '') return;
        const x = e.offsetX;
        const y = e.offsetY;
        switch(selectedTool) {
            case 'circle':
                drawCircle(startX, startY, x, y);
                break;
            case 'rectangle':
                drawRectangle(startX, startY, x, y);
                break;
            case 'text':
                // No dibujamos nada mientras movemos el mouse
                break;
            case 'arrow':
                drawArrow(startX, startY, x, y);
                break;
            default:
                break;
        }
    }

    function stopDrawing() {
        isDrawing = false;
        if (selectedTool !== 'text') {
            saveDrawing();
        }
    }

    function saveDrawing() {
        const drawing = ctx.getImageData(0, 0, canvas.width, canvas.height);
        drawings.push(drawing);
    }

    function undoLastDrawing() {
        if (drawings.length > 0) {
            drawings.pop();
            redrawCanvas();
        }
    }

    function clearDrawing() {
        drawings = [];
        redrawCanvas();
    }

    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawings.forEach(function(drawing) {
            ctx.putImageData(drawing, 0, 0);
        });
    }

    // FUNCIONES PARA DIBUJAR LAS FIGURAS 

    function drawCircle(startX, startY, endX, endY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas();
        ctx.beginPath();
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        ctx.lineWidth = document.getElementById('lineWidthRange').value; // Establecer el grosor de línea
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    function drawRectangle(startX, startY, endX, endY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas();
        ctx.beginPath();
        ctx.lineWidth = document.getElementById('lineWidthRange').value; // Establecer el grosor de línea
        ctx.rect(startX, startY, endX - startX, endY - startY);
        ctx.stroke();
    }

    function drawArrow(startX, startY, endX, endY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        // Calculamos la dirección de la flecha
        const angle = Math.atan2(endY - startY, endX - startX);
        // Dibujamos las puntas de la flecha
        const arrowSize = 10;
        ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }
    
    // HACER UN BOTON PARA ELEGIR COLORES DE UNA PALETA
    document.getElementById('colorPicker').addEventListener('input', function(event) {
        // Obtener el color seleccionado por el usuario
        const selectedColor = event.target.value;
        // Actualizar el color seleccionado
        ctx.strokeStyle = selectedColor;
    });
    
    
    // SELECTOR DEL TAMAÑO DE LAS FIGURAS
    document.getElementById('lineWidthRange').addEventListener('input', function(event) {
        // Obtener el valor seleccionado por el usuario
        const lineWidth = event.target.value;
        // Actualizar el grosor de línea
        ctx.lineWidth = lineWidth;
    });

    // Función para ajustar el tamaño del lienzo al tamaño de la ventana
    function resizeCanvas() {
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.6;
        redrawCanvas();
    }

    // Llamar a resizeCanvas al cargar la página y al cambiar el tamaño de la ventana
    window.addEventListener('load', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);
});
