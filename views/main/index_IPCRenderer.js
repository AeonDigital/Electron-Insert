/**
 * Modulo IPCRenderer
 *
 * Responsável por:
 * - carregar dados para inicialização da aplicação.
 * - Registrar listeners para comunicação do processo principal com a view.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
'use strict';





let appSettings = (() => {
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
                "cmdNew": "New File",
                "cmdOpen": "Open",
                "cmdSave": "Save",
                "cmdSaveAs": "Save as",
                "cmdCloseApp": "Close",
                "cmdMenu": "Menu",

                "cmdHeader1": "Header 1",
                "cmdHeader2": "Header 2",
                "cmdHeader3": "Header 3",
                "cmdHeader4": "Header 4",
                "cmdHeader5": "Header 5",
                "cmdHeader6": "Header 6",

                "cmdBold": "Bold",
                "cmdItalic": "Italic",
                "cmdUnderline": "underline",
                "cmdStrike": "strike"
            },
            "legend": {
                "newfile": "New file",
                "dialogSelectFile": "Select a file",
                "dialogConfirmCloseWithoutSave": "Do you want to save changes to the document \"[[shortName]]\" before closing?"
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
})();





//const btnclick = document.getElementById('loadnewwindow');
//btnclick.addEventListener('click', function () {
    //var arg = "secondparam";

    //send the info to main process . we can pass any arguments as second param.
    //ipcRenderer.send("btnclick", args); // ipcRender.send will pass the information to main process
//});

//ipcRenderer.on('btnclick-task-finished', function (event, param) {
    //alert("loaded a popup");
//});
