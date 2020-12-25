/**
 * Processo principal da aplicação Electron
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
'use strict';


const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const rootPath = require('path').dirname(require.main.filename).replace(new RegExp('\\\\', 'g'), '/');
const fs = require('fs');
let mainWindow = null;



function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    require(rootPath + '/views/main/index_IPCMain.js');
    mainWindow.loadFile(rootPath + '/views/main/index.html');

    mainWindow.on('closed', () => {
        mainWindow = null
    });
};





app.whenReady().then(createWindow);
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});





//
// Define os eventos que podem ser acionados de qualquer ponto da aplicação
// e por qualquer módulo do tipo "view".


/**
 * Retorna o caminho completo até a raiz da aplicação.
 */
ipcMain.on('getRootPathSync', (event, args) => {
    event.returnValue = rootPath;
});
/**
 * Efetua o carregamento de um arquivo JSON e retorna seu respectivo objeto.
 */
ipcMain.on('loadJsonFileSync', (event, fullPathToFile) => {
    let data = null;

    if (fs.existsSync(fullPathToFile) === true) {
        try {
            data = JSON.parse(fs.readFileSync(fullPathToFile));
        }
        catch (e) {
            data = null;
        }
    }

    event.returnValue = data;
});
/**
 * Abre uma janela de seleção de arquivos conforme as configurações passadas.
 * Retorna um objeto contendo o nome completo do arquivo selecionado e seu
 * respectivo conteúdo.
 */
ipcMain.on('dialogOpenFileSync', (event, args) => {
    let fileData = null;

    let options = {
        title: 'Select file',
        defaultPath: app.getPath("desktop"),
        filters: [
            { name: 'Text', extensions: ['', 'txt', 'md'] }
        ],
        properties: ['showHiddenFiles']
    };
    if (typeof (args) === 'object') {
        options.title = args.title;
        options.defaultPath = args.defaultPath;
        options.filters[0].extensions = args.extensions;
    }

    let filePaths = dialog.showOpenDialogSync(mainWindow, options);
    if (filePaths !== undefined && filePaths.length > 0) {
        let filePath = filePaths[0].replace(new RegExp('\\\\', 'g'), '/');
        let name = filePath.split('/').pop();

        fileData = {
            fullName: filePath,
            shortName: name,
            data: fs.readFileSync(filePath).toString()
        };

    }

    event.returnValue = fileData;
});
/**
 * Salva o estado atual do documento indicado.
 */
ipcMain.on('saveSync', (event, fileData) => {
    let r = false;

    try {
        fs.writeFileSync(
            fileData.fullName,
            fileData.data
        );
        r = true;
    }
    catch (err) {
        r = 'Erro ao salvar: ${err.message}';
    }

    event.returnValue = r;
});
/**
 * Salva o estado atual do documento indicado.
 */
ipcMain.on('saveAsSync', (event, fileData) => {
    let r = null;

    let options = {
        title: 'Select file',
        defaultPath: app.getPath("desktop"),
        filters: [
            { name: 'Text', extensions: ['', 'txt', 'md'] }
        ]
    };


    let filePath = dialog.showSaveDialogSync(mainWindow, options);
    if (filePath !== undefined) {
        filePath = filePath.replace(new RegExp('\\\\', 'g'), '/');
        let name = filePath.split('/').pop();

        r = {
            success: false,
            message: '',
            fullName: filePath,
            shortName: name,
            data: fileData.data
        };


        try {
            fs.writeFileSync(
                r.fullName,
                r.data
            );
            r.success = true;
        }
        catch (err) {
            console.log(err);
            r.message = 'Erro ao salvar: ${err.message}';
        }
    }

    event.returnValue = r;
});
