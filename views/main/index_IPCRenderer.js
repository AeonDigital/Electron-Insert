/**
 * Módulo que comunica os eventos da view com o processo principal.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
'use strict';





/**
 * Carrega os dados armazenados nos arquivos de configuração atual para que o
 * objeto principal do editor possa ser iniciado.
 */
let ipcRendererStart = () => {
    let rootPath = ipcRenderer.sendSync('getRootPath');
    let localePath = rootPath + '/resources/locale';


    let ini = ipcRenderer.sendSync('loadJsonFile', rootPath + '/ini.json');
    if (ini === null) {
        // Configuração padrão da aplicação.
        ini = {
            "defaultPath": "C:\\",
            "extensions": ["", "txt", "md"],
            "locale": "pt-BR",
            "spellcheck": false,
            "changedList": {
                "maxFiles": 10,
                "files": []
            }
        };
    }


    let locale = ipcRenderer.sendSync('loadJsonFile', localePath + '/' + ini.locale + '.json');
    if (locale === null) {
        locale = {
            "button": {
                "new": "New File",
                "open": "Open",
                "save": "Save",
                "saveAs": "Save as",
                "closeApp": "Close",
                "menu": "Menu",

                "header1": "Header 1",
                "header2": "Header 2",
                "header3": "Header 3",
                "header4": "Header 4",
                "header5": "Header 5",
                "header6": "Header 6",

                "bold": "Bold",
                "italic": "Italic",
                "underline": "underline",
                "strike": "strike"
            },
            "legend": {
                "newfile": "New file",
                "dialogSelectFile": "Select a file"
            }
        };
    }



    // Registra o evento que recebe os dados de um arquivo que deve
    // ser carregado no editor.
    ipcRenderer.on('dialogOpenFile-finished', (event, file) => {
        ins.openFile(file);
    });


    return {
        ini: ini,
        locale: locale
    };
};





//const btnclick = document.getElementById('loadnewwindow');
//btnclick.addEventListener('click', function () {
    //var arg = "secondparam";

    //send the info to main process . we can pass any arguments as second param.
    //ipcRenderer.send("btnclick", args); // ipcRender.send will pass the information to main process
//});

//ipcRenderer.on('btnclick-task-finished', function (event, param) {
    //alert("loaded a popup");
//});
