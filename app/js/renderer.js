const path = require('path');
const os = require('os');
const { ipcRenderer } = require('electron');

const form = document.getElementById('image-form');
const slider = document.getElementById('slider');
const img = document.getElementById('img');

document.getElementById('output-path').innerText = path.join(os.homedir(), 'imageresize');

form.addEventListener('submit', e => {
    const imgPath = img.files[0].path

    console.log(imgPath, quality)

    ipcRenderer.send('file:convert', {
        imgPath,
        quality
    })

    e.preventDefault()
})

ipcRenderer.on('file:done', () => {
    M.toast({
        html: `File converted to ${slider.value}`
    })
})