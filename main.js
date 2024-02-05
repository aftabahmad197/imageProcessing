// main.js

document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const originalCanvas = document.getElementById('originalCanvas');
    const modifiedCanvas = document.getElementById('modifiedCanvas');
    const filterControls = document.getElementById('filterControls');
    let originalImage, modifiedImage;
    let worker;

    imageInput.addEventListener('change', handleImageUpload);

    filterControls.innerHTML = `
        <label>
            <input type="radio" name="filter" value="grayscale" checked> Grayscale
        </label>
        <label>
            <input type="radio" name="filter" value="invert"> Invert
        </label>
        <!-- Add more filters as needed -->
    `;

    filterControls.addEventListener('change', applySelectedFilter);

    function applySelectedFilter() {
        const selectedFilter = document.querySelector('input[name="filter"]:checked').value;
        applyFilter(selectedFilter);
    }

    function applyFilter(filterType) {
        if (worker) {
            worker.terminate();
        }

        worker = new Worker('worker.js');

        worker.onmessage = function (event) {
            const modifiedImageData = event.data.imageData;
            drawImage(modifiedCanvas, createImageFromImageData(modifiedImageData));
        };

        const originalImageData = getImageData(originalCanvas);
        worker.postMessage({ imageData: originalImageData, filterType: filterType });
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                originalImage = new Image();
                originalImage.src = e.target.result;
                originalImage.onload = function () {
                    drawImage(originalCanvas, originalImage);
                    applySelectedFilter();
                };
            };
            reader.readAsDataURL(file);
        }
    }

    function getImageData(canvas) {
        const ctx = canvas.getContext('2d');
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function drawImage(canvas, image) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    function createImageFromImageData(imageData) {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        const image = new Image();
        image.src = canvas.toDataURL();
        return image;
    }
});
