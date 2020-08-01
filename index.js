const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin';

let mainWindow;
let aboutWindow;


function createMainWindow () {
    mainWindow = new BrowserWindow({
        title: "Waves",
        width: isDev ? 1000 : 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: true
        }
    })

    if(isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile('./app/index.html')
}

function createAboutWindow () {
    aboutWindow = new BrowserWindow({
        title: "About Image Resizer",
        width: 400,
        height: 400,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: false
    })

    aboutWindow.loadFile('./app/about.html')
}

const menu = [
    ...(isMac ? [{ 
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
     }] : []),
    {
        role: 'fileMenu'
    },
    ...(isDev ? [{ 
        label: 'Developer',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator'},
            { role: 'toggledevtools' },
        ]
     }] : []),
     ...(!isMac ? [{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
     }] : [])
    
]

app.on('ready', () => {

    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('close', e => mainWindow = null);

});

ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresize');
    resizeImage(options);

});

async function resizeImage({ imgPath, quality, dest }) {
    try{
        const pngQuality = quality/100

        const files = await imagemin([slash(imgPath)], { 
            destination: dest,
            plugins: [
                imageminMozjpeg({ quality }),
                imageminPngquant({ quality: [pngQuality, pngQuality] })
            ]
         })

         console.log(files);

         shell.openPath(dest);

         mainWindow.webContents.send('image:done');

    }catch(err){
        console.log(err);
    }

}

app.on('window-all-closed', () => {
    if (!isMac){
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  });
