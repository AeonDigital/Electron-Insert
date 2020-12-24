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
     * Controle para o próximo id a ser usado para a abertura de um novo arquivo.
     *
     * @type {int}
     */
    let atualId = 0;





    /**
     * Inicia um novo node de edição para um arquivo.
     *
     * @param {object} fileData
     */
    let openNewFileNode = (fileData) => {
        atualId++;

        // Prepara os dados mínimos para a geração de uma representação de um
        // arquivo dentro da aplicação.
        if (fileData === undefined) {
            fileData = {
                fullName: '',
                shortName: appSettings.locale.legend.newfile,
                data: ''
            };
        }
        fileData.id = atualId;
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
     * Retorna o objeto 'insertFile' correspondente ao id indicado.
     *
     * @param {int} id
     *
     * @return {insertFile}
     */
    let selectFileObjectById = (id) => {
        let r = null;

        for (let it in insertFiles) {
            let file = insertFiles[it];

            if (file.getId() === id) {
                r = file;
            }
        }

        return r;
    };
    /**
     * Remove o objeto 'insertFile' da coleção de itens abertos e também
     * remove seus respectivos nodes do DOM.
     *
     * @param {int} id
     *
     * @return {insertFile}
     */
    let removeFileObjectById = (id) => {

        let removeFile = null;
        let removeFileIndex = 0;

        for (let it in insertFiles) {
            let file = insertFiles[it];

            if (file.getId() === id) {
                removeFile = file;
                removeFileIndex = parseInt(it);
            }
        }

        removeFile.remove();
        insertFiles.splice(removeFileIndex, 1);


        // Se o item removido é o que estava em foco e ainda há
        // algum arquivo aberto no editor
        if (removeFile.getInFocus() === true && insertFiles.length > 0) {
            // Se possível,
            // Promove o item na mesma posição do anterior para o foco.
            if (removeFileIndex >= insertFiles.length) {
                removeFileIndex = (insertFiles.length - 1);
            }
            evtFileSetFocus({ target: insertFiles[removeFileIndex].getId() });
        }
    };
    /**
     * Retorna o objeto 'insertFile' que está em foco no momento.
     *
     * @return {?insertFile}
     */
    let selectFileObjectInFocus = () => {
        let r = null;

        for (let it in insertFiles) {
            let file = insertFiles[it];

            if (file.getInFocus() === true) {
                r = file;
            }
        }

        return r;
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
        let file = selectFileObjectById(id);

        // Havendo alterações, oferece a opção para que o usuário possa
        // salvar o arquivo.
        let canClose = true;
        if (file.getHasChanges() === true) {
            canClose = confirmCloseWithoutSave(file.getShortName());
        }

        if (canClose === true) {
            removeFileObjectById(id);
        }
    };





    /**
     * Questiona o usuário sobre sair sem salvar o arquivo atualmente aberto que contem
     * alterações.
     *
     * @param {string} fileShortName
     */
    let confirmCloseWithoutSave = (fileShortName) => {
        let msg = appSettings.locale.legend.dialogConfirmCloseWithoutSave.replace(
            '[[shortName]]', fileShortName
        );
        return confirm(msg);
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
        open: (e) => {
            if (e.target === undefined) {
                openNewFileNode(e);
            }
            else {
                ipcRenderer.send(
                    'dialogOpenFile',
                    {
                        title: appSettings.locale.legend.dialogSelectFile,
                        defaultPath: appSettings.ini.defaultPath,
                        extensions: appSettings.ini.extensions
                    }
                );
            }
        },
        /**
         * Salva o arquivo atualmente em foco se houverem alterações realizadas.
         */
        save: () => {
            let file = selectFileObjectInFocus();
            if (file !== null && file.getHasChanges() === true) {
                ipcRenderer.send('save', file);
            }
        },
        /**
         * Salva o arquivo atualmente em foco com um novo nome.
         */
        saveAs: () => {
            let file = selectFileObjectInFocus();
            if (file !== null && file.getHasChanges() === true) {
                ipcRenderer.send('saveAs', file);
            }
        },
        closeApp: () => {
            console.log('closeApp');
        }
    };


    return p;
})();
