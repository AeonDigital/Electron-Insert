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
    let rootPath = ipcRenderer.sendSync('getRootPathSync');
    let localePath = rootPath + '/resources/locale';


    let ini = ipcRenderer.sendSync('loadJsonFileSync', rootPath + '/ini.json');
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


    let locale = ipcRenderer.sendSync('loadJsonFileSync', localePath + '/' + ini.locale + '.json');
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
                "cmdStrike": "strike",

                "newfile": "New file"
            },
            "CMD": {
                "cmdFileClose": {
                    "confirmCloseWithoutSave": "Do you want to save changes to the document \"[[shortName]]\" before closing?"
                },
                "cmdOpen": {
                    "dialogConfig": {
                        "title": "Select a file",
                        "filterAllFiles": "All files",
                        "filterFileType": "Text file"
                    }
                },
                "cmdSave": {
                    "onFail": "An error occurred while saving the file \"[[shortName]]\"."
                },
                "cmdSaveAs": {
                    "dialogConfig": {
                        "title": "Salvar as",
                        "filterFileType": "Arquivo de texto"
                    },
                    "onFail": "An error occurred while saving the file as \"[[fullName]]\"."
                }
            }
        };
    }


    return {
        ini: ini,
        locale: locale
    };
})();
