document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let startX, startY;
    let drawings = [];
    let texts = [];
    let selectedTool = '';  // Mantener la herramienta seleccionada
    let selectedColor = 'black';
    let lineWidth = 3;
    let isDashed = false;
    let selectedTextIndex = null;
    let isMovingText = false;

    // Función para redimensionar el lienzo
    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        redrawCanvas();
    }

    // Función para guardar el dibujo actual
    function saveDrawing() {
        const drawing = ctx.getImageData(0, 0, canvas.width, canvas.height);
        drawings.push(drawing);
    }

    // Función para redibujar el lienzo
    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawings.forEach(function (drawing) {
            ctx.putImageData(drawing, 0, 0);
        });
        drawAllTexts();
    }

    // Función para dibujar todos los textos
    function drawAllTexts() {
        texts.forEach(text => {
            ctx.font = `${text.lineWidth * 5}px Arial`;
            ctx.fillStyle = text.color;
            ctx.fillText(text.text, text.x, text.y);
        });
    }

    // Función para comenzar el dibujo
    function startDrawing(e) {
        isDrawing = true;
        startX = e.offsetX;
        startY = e.offsetY;

        if (selectedTool === 'text') {
            const text = prompt('Ingrese el texto:');
            if (text) {
                texts.push({
                    text: text,
                    x: startX,
                    y: startY,
                    color: selectedColor,
                    lineWidth: lineWidth
                });
                saveDrawing();
                redrawCanvas();
            }
            isDrawing = false;
        } else {
            const clickedTextIndex = texts.findIndex(t => {
                ctx.font = `${t.lineWidth * 5}px Arial`;
                const textWidth = ctx.measureText(t.text).width;
                const textHeight = parseInt(ctx.font, 10);
                return startX >= t.x && startX <= t.x + textWidth && startY <= t.y && startY >= t.y - textHeight;
            });

            if (clickedTextIndex !== -1) {
                selectedTextIndex = clickedTextIndex;
                isMovingText = true;
                isDrawing = false;
            }
        }
    }

    // Función para dibujar durante el movimiento del mouse
    function draw(e) {
        if (!isDrawing || !selectedTool || selectedTool === 'text') return;
        const x = e.offsetX;
        const y = e.offsetY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas();

        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = selectedColor;
        if (isDashed) {
            ctx.setLineDash([10, 5]);
        } else {
            ctx.setLineDash([]);
        }

        switch (selectedTool) {
            case 'circle':
                drawCircle(startX, startY, x, y);
                selectedTool = 'circle';
                break;
            case 'rectangle':
                drawRectangle(startX, startY, x, y);
                selectedTool = 'rectangle';
                break;
            case 'continuousArrow':
                selectedTool = 'continuousArrow';
            case 'dashedArrow':
                drawArrow(startX, startY, x, y, isDashed);
                selectedTool = 'dashedArrow';
                break;
        }
        ctx.stroke();
    }

    // Función para detener el dibujo
    function stopDrawing(e) {
        if (isMovingText) {
            isMovingText = false;
            selectedTextIndex = null;
            return;
        }
        if (!isDrawing) return;
        isDrawing = false;
        saveDrawing();
    }

    // Función para dibujar un círculo
    function drawCircle(x1, y1, x2) {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y1 - y1, 2));
        ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    }

    // Función para dibujar un rectángulo
    function drawRectangle(x1, y1, x2, y2) {
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
    }

    // Función para dibujar una flecha
    function drawArrow(x1, y1, x2, y2, isDashed) {
        const headlen = 10;
        const angle = Math.atan2(y2 - y1, x2 - x1);

        ctx.moveTo(x1, y1);
        if (isDashed) {
            const dashLen = 5;
            const gapLen = 5;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const dashCount = Math.floor(len / (dashLen + gapLen));
            for (let i = 0; i < dashCount; i++) {
                const dashX = x1 + dx * (i / dashCount);
                const dashY = y1 + dy * (i / dashCount);
                ctx.moveTo(dashX, dashY);
                ctx.lineTo(dashX + dx * (dashLen / len), dashY + dy * (dashLen / len));
            }
        } else {
            ctx.lineTo(x2, y2);
        }

        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    }

    // Función para mover texto
    function moveText(e) {
        if (selectedTextIndex === null) return;

        const x = e.offsetX;
        const y = e.offsetY;

        const selectedText = texts[selectedTextIndex];
        selectedText.x = x;
        selectedText.y = y;
        redrawCanvas();
    }

    // Event listeners para dibujar
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mousemove', moveText);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Event listeners para seleccionar herramientas
    const toolItems = document.querySelectorAll('.tool-section li');
    toolItems.forEach(function (item) {
        item.addEventListener('click', function () {
            selectedTool = item.id.replace('Tool', '');
            isDashed = item.id.includes('dashed');

            toolItems.forEach(tool => tool.classList.remove('selected'));
            item.classList.add('selected');

            if (selectedTool === 'text') {
                canvas.classList.add('textCursor');
            } else {
                canvas.classList.remove('textCursor');
            }
        });
    });

    // Event listeners para cambiar el color
    const colorButtons = document.querySelectorAll('.colorButton');
    colorButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            selectedColor = button.dataset.color;
            colorButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
    });

    // Event listener para cambiar el grosor
    const lineWidthRange = document.getElementById('lineWidthRange');
    lineWidthRange.addEventListener('input', function () {
        lineWidth = this.value;
    });

    // Event listener para borrar todo
    const clearAllButton = document.getElementById('clearAllButton');
    clearAllButton.addEventListener('click', function () {
        if (confirm('¿Estás seguro de que quieres borrar todo?')) {
            drawings = [];
            texts = [];
            redrawCanvas();
        }
    });

    // Event listener para deshacer
    const undoButton = document.getElementById('undoButton');
    undoButton.addEventListener('click', function () {
        if (drawings.length > 0) {
            drawings.pop();
            texts.pop();
            redrawCanvas();
        }
    });

    window.addEventListener('load', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);

    var menuBtn = document.getElementById('menuBtn');
    var menuImage = document.getElementById('menuImage');
    var menuClickImage = document.getElementById('menuClickImage');

    var isMenuOpen = false;

    menuBtn.addEventListener('click', function () {
        var menuContent = document.getElementById('menuContent');
        if (isMenuOpen) {
            menuImage.style.display = 'block';
            menuContent.classList.remove('show');
            menuClickImage.style.display = 'none';
        } else {
            menuImage.style.display = 'none';
            menuContent.classList.add('show');
            menuClickImage.style.display = 'block';
        }
        isMenuOpen = !isMenuOpen;
    });
});
