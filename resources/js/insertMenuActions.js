'use strict';





/**
 * Coleções de ações do menu principal do editor.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertMenuActions = (() => {





    /**
     * Armazena a coleção de objetos 'insertFile' que correspondem a cada um dos
     * documentos atualmente abertos no editor.
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
     * Define o foco para o arquivo selecionado.
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
    /**
     * Fecha o arquivo selecionado.
     *
     * @param {evt} e
     */
    let evtFileClose = (e) => {
        let id = insertDOM.getTargetFileId(e.target);

        let removedIndex = 0;
        let removedFileFocus = false;
        let newCollection = [];
        for (let it in insertFiles) {
            let file = insertFiles[it];

            if (file.getId() === id) {
                removedIndex = parseInt(it);
                removedFileFocus = file.getInFocus();

                file.remove();
            }
            else {
                newCollection.push(file);
            }
        }
        insertFiles = newCollection;


        // Se o item removido é o que estava em foco...
        if (removedFileFocus === true && insertFiles.length > 0) {
            // Se possível,
            // Promove o item na mesma posição do anterior para o foco.
            if (removedIndex >- insertFiles.length) {
                removedIndex = (insertFiles.length - 1);
            }
            evtFileSetFocus({ target: insertFiles[removedIndex].getId() });
        }
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
         * para ser aberto no editor.
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
        openFile: (fileData) => {
            openNewFileNode(fileData);
            /*// verifica se o arquivo já não está aberto.
            let match = false;
            for (var it in openFiles) {
                if (openFiles[it].fullName === fileData.fullName) {
                    match = true;
                    selectFile(it);
                }
            }

            // Sendo mesmo para abrir o arquivo.
            if (match === false) {
                // identifica se o único arquivo aberto é um arquivo novo e vazio.
                if (openFiles.length === 1 && openFiles[0].data === '') {
                    actions.closeFile({ target: openFiles[0].closeButton });
                }
                openFiles.push(fileData);

                let useIndex = openFiles.length - 1;
                createSelectFileButton(fileData.shortName, useIndex, false);
                createEditableNode(useIndex, fileData.data);
                selectFile(useIndex);
            }*/
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
