

class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.layers = new LayerManager()
        this.colorPicker = document.getElementById('colorPicker');

        this.brushSize = document.getElementById('brushSize');
        this.brushTransparency = document.getElementById('brushTransparency');
        this.canvasWidthInput = document.getElementById('canvasWidth');
        this.canvasHeightInput = document.getElementById('canvasHeight');
        this.canvasBackgroundColor = 'white';
        this.isDrawing = false;
        this.mouseEffect = false;
        this.backgroundEffect = true;
        this.lastDrawn = 'figure'
        this.figures = [];
        this.gridLines = [];
        this.currentFigure = null;
        this.importButton = null;
        this.canvasFilter = null;
        this.image = {
            file: null,
            position: {x: 0, y: 0},
            size: {width: 0, height: 0},
            transparency: 0
        }
        this.images = []
        this.setupEventListeners();
        this.changeCanvasColor();
        this.applyFilters()
        this.checkClick()
    }

    checkClick = () => {
        document.getElementById('toggleToolsBtn').addEventListener('click', this.toggleTools.bind(this));
        document.getElementById('toggleToolsBtnImage').addEventListener('click', this.toggleToolsImage.bind(this));
        document.getElementById('toggleToolsBtnFilters').addEventListener('click', this.toggleToolsFilters.bind(this));
        document.getElementById('clearCanvasBtn').addEventListener('click', this.clearCanvas.bind(this));
        document.getElementById('export').addEventListener('click', this.exportCanvas.bind(this));
        document.getElementById('back').addEventListener('click', this.back.bind(this));
        document.getElementById('brushBtn').addEventListener('click', this.activateBrush.bind(this));
        document.getElementById('lineBtn').addEventListener('click', this.activateLine.bind(this));
        document.getElementById('drawRectangleBtn').addEventListener('click', this.activateRectangle.bind(this));
        document.getElementById('drawCircleBtn').addEventListener('click', this.activateCircle.bind(this));
        document.getElementById('drawTriangleBtn').addEventListener('click', this.activateTriangle.bind(this));
        document.getElementById('drawTextBtn').addEventListener('click', this.activateText.bind(this));
        document.getElementById('changeCanvasColorBtn').addEventListener('click', this.changeCanvasColor.bind(this));
        document.getElementById('resizeCanvasBtn').addEventListener('click', this.resizeCanvas.bind(this));
        document.getElementById('negative').addEventListener('click', this.negative.bind(this));
        document.getElementById('paralax').addEventListener('click', this.paralax.bind(this));
        document.getElementById('background').addEventListener('click', this.background.bind(this));
        document.getElementById('new').addEventListener('click', this.delete.bind(this));
        document.getElementById('save').addEventListener('click', this.save.bind(this));
        document.getElementById('load').addEventListener('click', this.load.bind(this));
    }

    setupEventListeners = () => {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        const blurInput = document.getElementById('blur');
        blurInput.addEventListener('input', this.applyFilters.bind(this));

        const brightnessInput = document.getElementById('brightness');
        brightnessInput.addEventListener('input', this.applyFilters.bind(this));

        const contrastInput = document.getElementById('contrast');
        contrastInput.addEventListener('input', this.applyFilters.bind(this));

        const grayscaleInput = document.getElementById('grayscale');
        grayscaleInput.addEventListener('input', this.applyFilters.bind(this));

        const sepiaInput = document.getElementById('sepia');
        sepiaInput.addEventListener('input', this.applyFilters.bind(this));

        const grid = document.getElementById('grid');
        grid.addEventListener('input', this.applyFilters.bind(this));

        const negative = document.getElementById('negative');
        negative.addEventListener('input', this.negative.bind(this));
    }

    resizeCanvas = () => {
        const widthPercent = parseInt(this.canvasWidthInput.value)/1.5
        const heightPercent = parseInt(this.canvasHeightInput.value);
        this.canvas.style.width = widthPercent + '%';
        this.canvas.style.height = heightPercent + '%';
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.redrawCanvas();
    }

    clearCanvas = () => {
        this.figures = [];
        this.images = []
        this.redrawCanvas();
    }

    redrawCanvas = async () => {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.canvasBackgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineWidth = 0.4;
    
        await this.drawGrid();
    
        this.layers.layerNumbers.forEach(async (layer) => {
            try {
                if (this.images.length > 0) {
                    this.images.forEach(async (img) => {
                        if (img.layer == layer.number && layer.check) {
                            this.ctx.globalAlpha = img.transparency;
                            await this.ctx.drawImage(img.file, img.position.x, img.position.y, img.size.width, img.size.height);
                        }
                    });
                }
            } catch (e) {
                console.log("No images yet");
            }
    
            this.figures.forEach(async (figure) => {
                if (figure.layer == layer.number && layer.check) {
                    await this.drawFigure(figure);
                }
            })
        })
    }    

    drawFigure = (figure) => {
        this.ctx.strokeStyle = `${figure.color}`;
        this.ctx.globalAlpha = figure.transparency;
        this.ctx.lineWidth = figure.lineWidth;
        this.ctx.beginPath();
        switch (figure.type) {
            case 'brush':
                this.ctx.lineJoin = 'round';
                this.ctx.lineCap = 'round';
                this.ctx.moveTo(figure.startX, figure.startY);
                this.ctx.lineTo(figure.endX, figure.endY);
                break;
            case 'line':
                this.ctx.moveTo(figure.startX, figure.startY);
                this.ctx.lineTo(figure.endX, figure.endY);
                break;
            case 'rectangle':
                this.ctx.rect(figure.startX, figure.startY, figure.width, figure.height);
            break;
            case 'circle':
                this.ctx.arc(figure.centerX, figure.centerY, figure.radius, 0, 2 * Math.PI);
                break;
            case 'triangle':
                this.ctx.moveTo(figure.vertices[0].x, figure.vertices[0].y);
                this.ctx.lineTo(figure.vertices[1].x, figure.vertices[1].y);
                this.ctx.lineTo(figure.vertices[2].x, figure.vertices[2].y);
                this.ctx.closePath();
                break;
            case 'text':
                this.ctx.font = "48px serif";
                this.ctx.fillStyle = "red";
                this.ctx.fillText("Hello world", figure.startX, figure.startY);
                break;
        }
        this.ctx.stroke();
    }

    startDrawing = (e) => {
        if (!this.isBrushActive && !this.isRectangleActive && !this.isCircleActive && !this.isTriangleActive) return;
        this.isDrawing = true;
        this.lastDrawn = 'figure';
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];

        this.currentFigure = {
            layer:  this.layers.selected,
            color: this.colorPicker.value,
            lineWidth: this.brushSize.value,
            transparency: this.brushTransparency.value,
            type: this.isTextActive ? 'text' : (this.isLineActive ? 'line' : ( this.isBrushActive ? 'brush' : ( this.isRectangleActive ? 'rectangle' : (this.isCircleActive ? 'circle' : 'triangle')))),
            startX: e.offsetX,
            startY: e.offsetY,
            endX: e.offsetX,
            endY: e.offsetY,
            centerX: e.offsetX,
            centerY: e.offsetY,
            radius: 0,
            width: 0,
            height: 0,
            vertices: [
                { x: e.offsetX, y: e.offsetY },
                { x: e.offsetX, y: e.offsetY },
                { x: e.offsetX, y: e.offsetY }
            ]
        };
    }

    draw = (e) => {
        if (!this.isDrawing) return;
        if (this.importButton) {
            this.importButton.remove();
            this.importButton = null;
        }

        switch (this.currentFigure.type) {
            case 'brush':
                this.figures.push({
                    type: 'brush',
                    layer: this.layers.selected,
                    color: this.colorPicker.value,
                    lineWidth: this.brushSize.value,
                    transparency: this.brushTransparency.value,
                    startX: this.lastX,
                    startY: this.lastY,
                    endX: e.offsetX,
                    endY: e.offsetY
                });
                this.lastX = e.offsetX;
                this.lastY = e.offsetY;
                break;
            case 'line':
                this.currentFigure.endX = e.offsetX;
                this.currentFigure.endY = e.offsetY;
                break;
            case 'rectangle':
                this.currentFigure.width = e.offsetX - this.currentFigure.startX;
                this.currentFigure.height = e.offsetY - this.currentFigure.startY;
                break;
            case 'circle':
                this.currentFigure.radius = Math.sqrt(Math.pow(e.offsetX - this.currentFigure.centerX, 2) + Math.pow(e.offsetY - this.currentFigure.centerY, 2));
                break;
            case 'triangle':
                this.currentFigure.vertices[1].x = this.currentFigure.startX + (e.offsetX - this.currentFigure.startX) / 2;
                this.currentFigure.vertices[1].y = e.offsetY;
                this.currentFigure.vertices[2].x = e.offsetX;
                this.currentFigure.vertices[2].y = this.currentFigure.startY;
                break;
            case 'text':
                this.currentFigure.width = e.offsetX - this.currentFigure.startX;
                this.currentFigure.height = e.offsetY - this.currentFigure.startY;
                break;
        }

        this.redrawCanvas();
        this.drawFigure(this.currentFigure);
    }

    stopDrawing = () => {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.figures.push(this.currentFigure);

            if (this.currentFigure.type === 'rectangle') {
                this.importButton = document.createElement('button');
                this.importButton.id = 'Import';
                this.importButton.textContent = 'Image';
                this.importButton.style.position = 'absolute';
                this.importButton.style.left = `${30}%`;
                this.importButton.style.top = `${19}%`;
                this.importButton.style.zIndex = '100';

                this.importButton.addEventListener('click', this.importImage.bind(this,
                    { x: Math.abs(this.currentFigure.startX), y: Math.abs(this.currentFigure.startY) },
                    { width: Math.abs(this.currentFigure.height), height: Math.abs(this.currentFigure.width) }
                ));


                document.body.appendChild(this.importButton);
            }

            this.currentFigure = null;
        }
    }

    activateBrush = () => {
        this.isBrushActive = true;
        this.isLineActive = false;
        this.isRectangleActive = false;
        this.isCircleActive = false;
        this.isTriangleActive = false;
        this.isTextActive = false;
    }

    activateLine = () => {
        this.isBrushActive = false;
        this.isLineActive = true;
        this.isRectangleActive = false;
        this.isCircleActive = false;
        this.isTriangleActive = false;
        this.isTextActive = false;
    }    

    activateRectangle = () => {
        this.isBrushActive = false;
        this.isLineActive = false;
        this.isRectangleActive = true;
        this.isCircleActive = false;
        this.isTriangleActive = false;
        this.isTextActive = false;
    }

    activateCircle = () => {
        this.isBrushActive = false;
        this.isLineActive = false;
        this.isRectangleActive = false;
        this.isCircleActive = true;
        this.isTriangleActive = false;
        this.isTextActive = false;
    }

    activateTriangle = () => {
        this.isBrushActive = false;
        this.isLineActive = false;
        this.isRectangleActive = false;
        this.isCircleActive = false;
        this.isTriangleActive = true;
        this.isTextActive = false;
    }

    activateText = () => {
        this.isBrushActive = false;
        this.isLineActive = false;
        this.isRectangleActive = false;
        this.isCircleActive = false;
        this.isTriangleActive = false;
        this.isTextActive = true;
    }

    changeCanvasColor = async() => {
        this.canvasBackgroundColor = this.canvasBackgroundColor === '#fff' ? '#000' : '#fff';
        await this.redrawCanvas();
    }

    toggleTools = () => {
        this.openTools = !this.openTools;
        const toolsContainer = document.getElementById('toolsContainer');
        toolsContainer.style.display = this.openTools ? 'block' : 'none';

        if (this.openTools) {
            const imageContainer = document.getElementById('toolsContainerImage');
            imageContainer.style.display = 'none';
            const filtersContainer = document.getElementById('toolsContainerFilters');
            filtersContainer.style.display = 'none';
        }
    }

    toggleToolsImage = () => {
        this.openImage = !this.openImage;
        const imageContainer = document.getElementById('toolsContainerImage');
        imageContainer.style.display = this.openImage ? 'block' : 'none';

        if (this.openImage) {
            const toolsContainer = document.getElementById('toolsContainer');
            toolsContainer.style.display = 'none';
            const filtersContainer = document.getElementById('toolsContainerFilters');
            filtersContainer.style.display = 'none';
        }
    }

    toggleToolsFilters = () => {
        this.openFilters = !this.openFilters;
        const filtersContainer = document.getElementById('toolsContainerFilters');
        filtersContainer.style.display = this.openFilters ? 'block' : 'none';

        if (this.openFilters) {
            const toolsContainer = document.getElementById('toolsContainer');
            toolsContainer.style.display = 'none';
            const imageContainer = document.getElementById('toolsContainerImage');
            imageContainer.style.display = 'none';
        }
    }

    importImage = async (position, size) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
    
        const file = await new Promise((resolve, reject) => {
            input.onchange = (e) => resolve(e.target.files[0]);
            input.click();
        });
    
        if (file) {
            try {
                const reader = new FileReader();
    
                const fileDataURL = await new Promise((resolve, reject) => {
                    reader.onload = (event) => resolve(event.target.result);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
    
                const image = {
                    file: new Image(),
                    layer: this.layers.selected,
                    position: { x: position.x, y: position.y },
                    size: { width: size.height, height: size.width },
                    transparency: this.brushTransparency.value
                };
    
                await new Promise((resolve, reject) => {
                    image.file.onload = () => { 
                        this.images.push(image);
                        this.redrawCanvas();
                        resolve();
                    };
                    image.file.onerror = (e) => reject(e);
                    image.file.src = fileDataURL;
                });
    
                this.lastDrawn = 'image';
            } catch (e) {
                console.log(e);
            }
        }
    }    

    applyFilters = () => {
        const blur = document.getElementById('blur').value;
        const brightness = document.getElementById('brightness').value;
        const contrast = document.getElementById('contrast').value;
        const grayscale = document.getElementById('grayscale').value;
        const sepia = document.getElementById('sepia').value;
        const grid = document.getElementById('grid').value;
        let cellX = this.canvas.width / grid;
        let cellY = this.canvas.height / grid
        this.canvasFilter = `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
        this.canvas.style.filter = this.canvasFilter

        this.clearGrid();

        if (grid > 0) {
            this.ctx.lineWidth = 0.4;

            for (let x = 0; x <= this.canvas.width; x += cellX) {
                this.gridLines.push({ x1: x, y1: 0, x2: x, y2: this.canvas.height });
            }

            for (let y = 0; y <= this.canvas.height; y += cellY) {
                this.gridLines.push({ x1: 0, y1: y, x2: this.canvas.width, y2: y });
            }
        }
        this.redrawCanvas()
    }

    clearGrid = () => {
        this.gridLines = [];
    }

    drawGrid = () => {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'black';
        for (let i = 0; i < this.gridLines.length; i++) {
            const line = this.gridLines[i];
            this.ctx.moveTo(line.x1, line.y1);
            this.ctx.lineTo(line.x2, line.y2);
        }
        this.ctx.stroke();
    }

    negative = () => {
        const neg = document.getElementById('negative').value;
        const back = document.getElementById('videoBackground')
        back.style.filter = `invert(${neg}%)`;
    }

    exportCanvas = () =>{
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'canvas.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    back = () => {
        if (this.lastDrawn == 'figure') {
            this.figures.pop();
        } else {
            this.images.pop();
            this.lastDrawn = 'figure';
        }
        this.redrawCanvas();
    }    

    paralax = () => {
        if(this.mouseEffect){
            document.addEventListener('mousemove', e => {
                Object.assign(document.documentElement, {
                    style: `
                    --move-x: ${(e.clientX - window.innerWidth / 2) * -.0}deg;
                    --move-y: ${(e.clientY - window.innerHeight / 2) * -.0}deg;
                    `
                })
            })
            this.mouseEffect = !this.mouseEffect
        } else {
            document.addEventListener('mousemove', e => {
                Object.assign(document.documentElement, {
                    style: `
                    --move-x: ${(e.clientX - window.innerWidth / 2) * -.01}deg;
                    --move-y: ${(e.clientY - window.innerHeight / 2) * -.05}deg;
                    `
                })
            })
            this.mouseEffect = !this.mouseEffect
        }
    }

    background = () => {
        const back = document.getElementById('videoBackground')
        if(this.backgroundEffect) back.style.opacity = 0; 
        else back.style.opacity = 1; 
        this.backgroundEffect = !this.backgroundEffect
    }

    save = async () => {
        localStorage.setItem('colorPicker', this.colorPicker.value);
        localStorage.setItem('brushSize', this.brushSize.value);
        localStorage.setItem('brushTransparency', this.brushTransparency.value);
        localStorage.setItem('canvasWidth', this.canvasWidthInput.value);
        localStorage.setItem('canvasHeight', this.canvasHeightInput.value);
        localStorage.setItem('canvasBackgroundColor', this.canvasBackgroundColor);
        localStorage.setItem('isDrawing', this.isDrawing);
        localStorage.setItem('mouseEffect', this.mouseEffect);
        localStorage.setItem('backgroundEffect', this.backgroundEffect);
        localStorage.setItem('figures', JSON.stringify(this.figures));
        localStorage.setItem('gridLines', JSON.stringify(this.gridLines));
        localStorage.setItem('currentFigure', JSON.stringify(this.currentFigure));
        localStorage.setItem('importButton', JSON.stringify(this.importButton));
        localStorage.setItem('canvasFilter', this.canvasFilter);
        localStorage.setItem('images', JSON.stringify(this.images));
        localStorage.setItem('selected', JSON.stringify(this.layers.selected));
        localStorage.setItem('layerNumbers', JSON.stringify(this.layers.layerNumbers));
    }

    load = async () => {
        this.colorPicker.value = localStorage.getItem('colorPicker');
        this.brushSize.value = localStorage.getItem('brushSize');
        this.brushTransparency.value = localStorage.getItem('brushTransparency');
        this.canvasWidthInput.value = localStorage.getItem('canvasWidth');
        this.canvasHeightInput.value = localStorage.getItem('canvasHeight');
        this.canvasBackgroundColor = localStorage.getItem('canvasBackgroundColor');
        this.isDrawing = localStorage.getItem('isDrawing') === 'true';
        this.mouseEffect = localStorage.getItem('mouseEffect') === 'true';
        this.backgroundEffect = localStorage.getItem('backgroundEffect') === 'true';
        this.figures = JSON.parse(localStorage.getItem('figures'));
        this.gridLines = JSON.parse(localStorage.getItem('gridLines'));
        this.currentFigure = JSON.parse(localStorage.getItem('currentFigure'));
        this.importButton = JSON.parse(localStorage.getItem('importButton'));
        this.canvasFilter = localStorage.getItem('canvasFilter');
        this.images = JSON.parse(localStorage.getItem('images'));
        this.layers.selected = localStorage.getItem('selected');
        this.layers.layerNumbers = JSON.parse(localStorage.getItem('layerNumbers'));

        await this.redrawCanvas()
        await this.resizeCanvas()
    }

    delete = () => {
        localStorage.clear();
        window.location.reload(); 
    }
}

const drawingApp = new DrawingApp();