'use strict';





/**
 * Coleções de ações do menu principal do ›Insert Editor.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertMenuActions = (() => {





    /**
     * Armazena a coleção de objetos 'insertFile' que correspondem a cada um dos
     * documentos atualmente abertos no ›Insert Editor.
     *
     * @type {insertFile[]}
     */
    let insertFiles = [];



    /**
     * Inicia um novo node de edição para um arquivo.
     *
     * @param {object} fileData
     */
    let openNewFileNode = (fileData) => {

        // Prepara os dados mínimos para a geração de uma representação de um
        // arquivo dentro da aplicação.
        if (fileData === undefined) {
            fileData = {
                fullName: '',
                shortName: appSettings.locale.legend.newfile
            };
        }
        fileData.id = insertFiles.length;
        fileData.evtFileSetFocus = evtFileSetFocus;
        fileData.evtFileClose = evtFileClose;


        //
        // Se trata-se de um arquivo existente...
        // Não permite que o mesmo arquivo seja aberto 2x
        let isNewFile = true;
        if (fileData.fullName !== '' && insertFiles.length > 0) {
            for (let it in insertFiles) {
                if (insertFiles[it].getFullName() === fileData.fullName) {
                    isNewFile = false;
                }
            }
        }


        if (isNewFile === true) {
            insertFiles.push(new insertFile(fileData));
            evtFileSetFocus({ target: fileData.id });
        }
    };





    /**
     * Define o arquivo que deve estar em foco.
     *
     * @param {evt} e
     */
    let evtFileSetFocus = (e) => {
        let id = insertDOM.getTargetFileId(e.target);

        for (let it in insertFiles) {
            let file = insertFiles[it];
            if (file.getId() === id) {
                file.redefineFocus(true);
            }
            else {
                if (file.getInFocus() === true) {
                    file.redefineFocus(false);
                }
            }
        }
    };
    let evtFileClose = (e) => {

    };





    let p = this.Control = {
        /**
         * Abre um novo arquivo de texto.
         */
        new: () => {
            openNewFileNode();
        },
        /**
         * Abre a janela de dialogo permitindo ao usuário selecionar um novo arquivo
         * para ser aberto no ›Insert Editor.
         */
        open: () => {
            ipcRenderer.send(
                'dialogOpenFile',
                {
                    title: appSettings.locale.legend.dialogSelectFile,
                    defaultPath: appSettings.ini.defaultPath,
                    extensions: appSettings.ini.extensions
                }
            );
        },
        save: () => {

        },
        saveAs: () => {

        },
        closeFile: (e) => {

        }
    };


    return p;
})();
