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
        },
        icon: rootPath + '/electron-insert.ico'
    });
    mainWindow.removeMenu();

    require(rootPath + '/views/main/index_IPCMain.js');
    mainWindow.loadFile(rootPath + '/views/main/index.html');


    // Impede o encerramento abrupto da aplicação efetuando antes
    // uma conferência sobre se todos os itens atualmente abertos estão
    // salvos.
    mainWindow.on('close', (e) => {
        if (mainWindow) {
            e.preventDefault();
            mainWindow.webContents.send('cmdCanClose');
        }
    });
};




/**
 * Encerra completamente a aplicação.
 */
let closeAppWindow = () => {
    mainWindow = null;
    if (process.platform !== 'darwin') {
        app.quit();
    }
};





app.whenReady().then(createWindow);
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
app.on('window-all-closed', () => {
    closeAppWindow();
});





//
// Define os eventos que podem ser acionados de qualquer ponto da aplicação
// e por qualquer módulo do tipo "view".

/**
 * Retorna o conteúdo de um arquivo em um objeto json.
 *
 * @param {string} fullPathToFile
 *
 * @return {json}
 */
let loadJsonFileSync = (fullPathToFile) => {
    let r = undefined;

    if (fs.existsSync(fullPathToFile) === true) {
        try { r = JSON.parse(fs.readFileSync(fullPathToFile)); }
        catch (err) { console.log(err); }
    }

    return r;
};
/**
 * Identifica quando o local passado para abrir uma caixa de dialogo de seleção
 * de arquivo está apontando para uma posição válida.
 * Caso o caminho passado seja inválido, será retornado o valor 'desktop'
 *
 * @param {string} path
 */
let retrieveDialogPath = (path) => {
    let usePath = null;

    if (path === 'rootPath') {
        usePath = rootPath;
    }
    else {
        let allowedShortcuts = ['home', 'desktop', 'documents', 'downloads', 'music', 'pictures', 'videos', 'userData'];
        if (allowedShortcuts.includes(path) === true) {
            usePath = app.getPath(path);
        }
        else {
            if (fs.existsSync(path) === false) {
                usePath = app.getPath('desktop');
            }
            else {
                usePath = path;
            }
        }
    }

    return usePath.replace(new RegExp('\\\\', 'g'), '/');
};
/**
 * Abre uma caixa de dialogo do tipo "fileSystem" permitindo ao usuário efetuar uma seleção
 * de arquivos ou indicar caminhos a serem usados (tudo conforme as configurações passadas).
 *
 * @param {string} dialogTitle
 * @param {string} dialogDefaultPath
 * @param {array} dialogFileFilters
 * @param {array} dialogProperties
 *
 * @return {string}
 */
let dialogOpenFileSystemSync = (dialogTitle, dialogDefaultPath, dialogFileFilters, dialogProperties) => {
    let r = null;

    let options = {
        title: dialogTitle,
        defaultPath: retrieveDialogPath(dialogDefaultPath),
        filters: dialogFileFilters,
        properties: dialogProperties
    };


    r = dialog.showOpenDialogSync(mainWindow, options);
    if (r !== undefined) {
        if (Array.isArray(r) === true) {
            r = r[0];
        }
        r = r.replace(new RegExp('\\\\', 'g'), '/');
    }

    return r;
};
/**
 * Abre uma caixa de diálogo do tipo "fileSystem" permitindo ao usuário selecionar o local e o
 * nome com o qual um arquivo será salvo.
 *
 * @param {string} dialogTitle
 * @param {string} dialogDefaultPath
 * @param {array} dialogFileFilters
 *
 * @return {string}
 */
let dialogSaveFileSystemSync = (dialogTitle, dialogDefaultPath, dialogFileFilters) => {
    let r = null;

    let options = {
        title: dialogTitle,
        defaultPath: retrieveDialogPath(dialogDefaultPath),
        filters: dialogFileFilters
    };


    r = dialog.showSaveDialogSync(mainWindow, options);
    if (r !== undefined) {
        r = r.replace(new RegExp('\\\\', 'g'), '/');
    }

    return r;
};
/**
 * Salva o o conteúdo passado no local indicado.
 *
 * @param {string} fullPathToFile
 * @param {string} fileData
 *
 * @return {bool}
 */
let saveFileSync = (fullPathToFile, fileData) => {
    let r = false;

    try {
        fs.writeFileSync(fullPathToFile, fileData);
        r = true;
    }
    catch (err) { console.log(err); }

    return r;
};





/**
 * Expõe para a view o método 'app.getPath'
 */
ipcMain.on('getPathSync', (event, args) => {
    event.returnValue = retrieveDialogPath(args);
});
/**
 * Efetua o carregamento de um arquivo JSON e retorna seu respectivo objeto.
 */
ipcMain.on('loadJsonFileSync', (event, args) => {
    event.returnValue = loadJsonFileSync(args);
});
/**
 * Gera um novo arquivo de configurações para o perfil do usuário atualmente
 * logado no sistema.
 */
ipcMain.on('generateUserIniSync', (event, args) => {
    event.returnValue = saveFileSync(args.path, args.data);
})



/**
 * Encerra completamente a aplicação.
 */
ipcMain.on('cmdCanCloseOk', () => {
    closeAppWindow();
});



/**
 * Abre uma janela de seleção de arquivos permitindo ao usuário efetuar a
 * seleção de qual deve ser aberto no editor.
 * Retorna um objeto 'insertFile' com os dados mínimos necessários para abrir
 * o novo arquivo.
 */
ipcMain.on('cmdOpenSync', (event, args) => {
    let r = undefined;
    let appSettings = args.appSettings;

    let targetFile = dialogOpenFileSystemSync(
        appSettings.locale.CMD.cmdOpen.dialogConfig.title,
        appSettings.ini.defaultPath,
        [
            {
                name: appSettings.locale.CMD.cmdOpen.dialogConfig.filterAllFiles,
                extensions: ['*']
            },
            {
                name: appSettings.locale.CMD.cmdOpen.dialogConfig.filterFileType,
                extensions: appSettings.ini.extensions
            }
        ],
        ['showHiddenFiles']
    );

    if (targetFile !== undefined) {
        let name = targetFile.split('/').pop();

        r = {
            fullName: targetFile,
            shortName: name,
            data: fs.readFileSync(targetFile).toString(),
            isNew: false
        };
    }

    event.returnValue = r;
});
/**
 * Abre o arquivo indicado e retorna seus dados para a view
 */
ipcMain.on('cmdOpenFileSync', (event, args) => {
    let r = null;

    // Verifica se o arquivo alvo existe
    if (fs.existsSync(args) === true) {
        let name = args.split('/').pop();

        r = {
            fullName: args,
            shortName: name,
            data: fs.readFileSync(args).toString(),
            isNew: false
        };
    }

    event.returnValue = r;
});
/**
 * Salva o estado atual do documento indicado.
 */
ipcMain.on('cmdSaveSync', (event, args) => {
    event.returnValue = saveFileSync(args.fullName, args.data);
});
/**
 * Salva o estado atual do documento em um novo arquivo.
 */
ipcMain.on('cmdSaveAsSync', (event, args) => {
    let r = undefined;
    let appSettings = args.appSettings;

    let targetFile = dialogSaveFileSystemSync(
        appSettings.locale.CMD.cmdSaveAs.dialogConfig.title,
        appSettings.ini.defaultPath,
        [
            {
                name: appSettings.locale.CMD.cmdOpen.dialogConfig.filterAllFiles,
                extensions: ['*']
            },
            {
                name: appSettings.locale.CMD.cmdSaveAs.dialogConfig.filterFileType,
                extensions: appSettings.ini.extensions
            }
        ]
    );


    if (targetFile !== undefined) {
        r = {
            success: saveFileSync(targetFile, args.data),
            fullName: targetFile,
            shortName: targetFile.split('/').pop()
        };
    }

    event.returnValue = r;
});
