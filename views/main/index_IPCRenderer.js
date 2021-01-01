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
    let rootPath = ipcRenderer.sendSync('getPathSync', 'rootPath');
    let userData = ipcRenderer.sendSync('getPathSync', 'userData');
    let localePath = rootPath + '/resources/locale';


    // Primeiramente carrega o Ini padrão da aplicação
    let ini = ipcRenderer.sendSync('loadJsonFileSync', rootPath + '/ini.json');
    if (ini === undefined) {
        // Configuração padrão da aplicação.
        ini = {
            "defaultPath": "C:\\",
            "extensions": ["", "txt", "md"],
            "locale": "us-EN",
            "spellcheck": false,
            "recentFileList": {
                "maxFiles": 10,
                "files": [
                    [
                        "fullNameFromFirstFile",
                        true
                    ],
                    [
                        "fullNameFromSecondFile",
                        false
                    ],
                    [
                        "fullNameFromThirdFile",
                        false
                    ]
                ]
            },
            "editorStyle": {
                "background-color": "#666666",
                "font-family": "Fira Code",
                "font-style": "",
                "font-weight": "",
                "color": "#EEEEEE",
                "font-size": "16px",
                "line-height": "24px"
            }
        };
    }



    // Verifica se há um Ini para o usuário atual, havendo, carrega-o.
    // não havendo, gera um igual ao padrão para a aplicação
    let profileIni = ipcRenderer.sendSync('loadJsonFileSync', userData + '/user.json');
    if (profileIni === undefined) {
        ipcRenderer.sendSync('generateUserIniSync', {
            path: userData + '/user.json',
            data: JSON.stringify(ini, null, 4)
        });
    }
    // Encontrando o arquivo de perfil do usuário, efetua o merge entre ele e
    // o ini da aplicação.
    else {
        let useIni = {};
        Object.keys(ini).forEach((key) => { useIni[key] = ini[key]; });
        Object.keys(profileIni).forEach((key) => { useIni[key] = profileIni[key]; });
        ini = useIni;
    }





    let locale = ipcRenderer.sendSync('loadJsonFileSync', localePath + '/' + ini.locale + '.json');
    if (locale === undefined) {
        locale = {
            "button": {
                "cmdNew": "New File",
                "cmdOpen": "Open",
                "cmdSave": "Save",
                "cmdSaveAs": "Save as",
                "cmdRecents": "Recents",
                "cmdFavorites": "Favorites",
                "cmdAddFavorite": "Add to favorites",
                "cmdRemoveFavorite": "Remove from favorites",
                "cmdCanClose": "Close",
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

                "newfile": "New file",
                "cmdOpenSettings": "Settings"
            },
            "settings": {
                "nav": {
                    "tabConfig": "Settings",
                    "tabAbout": "About"
                },
                "panel": {
                    "configuration": {
                        "ttlGeneral": "General",
                        "fldLblLanguage": "Language",
                        "fldLblLineCounter": "Line counter",
                        "ttlTextEditor": "Text editor",
                        "fldLblEditorBackgroundColor": "Background color",
                        "fldLblEditorFontFace": "Font",
                        "fldLblEditorFontStyle": "Style",
                        "fldLblEditorFontColor": "Color",
                        "fldLblEditorFontSize": "Font size",
                        "fldLblEditorLineHeight": "Line height",
                        "btnSaveConfiguration": "Save configurations"
                    }
                }
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
                },
                "cmdCanClose": {
                    "dialogConfirmClose": "There are open files that have not been saved.\nIf you continue all unsaved data will be lost.\nAre you sure you want to close?"
                },
                "cmdOpenFile": {
                    "onFail": "Cannot find file \"[[fullName]]\""
                },
                "cmdSaveConfigurations": {
                    "onFail": "Error on save preferences",
                    "onSuccess": "Success on saved preferences"
                }
            }
        };
    }


    // Registra o evento que confere se é seguro fechar a aplicação evitando perder
    // dados de arquivo que esteja aberto e não esteja salvo.
    ipcRenderer.on('cmdCanClose', (event) => {
        appInsert.cmdCanClose();
    });


    return {
        ini: ini,
        locale: locale
    };
})();
