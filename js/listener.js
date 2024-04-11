class LayerManager {
    constructor() {
        this.layerBox = document.getElementById('layer-box');
        this.addLayerBtn = document.getElementById('add-layer-btn');
        this.layerCounter = 1;
        this.layerNumbers = [];
        this.setupEventListeners();
        this.addLayer()
        this.selected = 1;
    }

    setupEventListeners = () => {
        this.addLayerBtn.addEventListener('click', this.addLayer.bind(this));
        this.layerBox.addEventListener('click', this.handleLayerClick.bind(this));
        this.layerBox.addEventListener('change', this.handleVisibilityChange.bind(this));
    }

    addLayer = () => {
        const layerItem = document.createElement('div');
        layerItem.classList.add('layer-item');
        layerItem.setAttribute('draggable', true);
        layerItem.innerHTML = `
            <input type="checkbox" id="layer-${this.layerCounter}" checked>
            <label for="layer-${this.layerCounter}">Layer ${this.layerCounter}</label>
            <button class="delete-layer-btn">Delete</button>
        `;
        this.layerBox.appendChild(layerItem);
        this.layerNumbers.push({number: this.layerCounter, check: true})
        this.layerCounter++;
    }

    handleLayerClick = (event) => {
        if (event.target.tagName === 'LABEL') {
            event.preventDefault();
            const selectedLayerId = event.target.getAttribute('for');
            const selectedLayerNumber = parseInt(selectedLayerId.split('-')[1]);
            this.selected = selectedLayerNumber;
            console.log('Selected layer:', this.selected);
        } else if (event.target.classList.contains('delete-layer-btn')) {
            event.target.parentElement.remove();
            const deletedLayerId = event.target.previousElementSibling.getAttribute('for');
            const deletedLayerNumber = parseInt(deletedLayerId.split('-')[1]);
            const index = this.layerNumbers.findIndex(layer => layer.number === deletedLayerNumber);
            if (index !== -1) {
                this.layerNumbers.splice(index, 1);
            }
            if (this.selected === deletedLayerNumber) {
                this.selected = this.layerNumbers.length > 0 ? this.layerNumbers[0].number : null;
            }
        }
    }

    handleVisibilityChange = (event) => {
        if (event.target.tagName === 'INPUT') {
            const selectedLayerId = event.target.id;
            const selectedLayerNumber = parseInt(selectedLayerId.split('-')[1]);
            const isChecked = event.target.checked;
            const index = this.layerNumbers.findIndex(layer => layer.number === selectedLayerNumber);
            if (index !== -1) {
                this.layerNumbers[index].check = isChecked;
            }
            
            const canvasId = selectedLayerId.replace('layer-', 'canvas-');
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                canvas.style.visibility = isChecked ? 'visible' : 'hidden';
            }
        }
    }    
}
