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
     * Nome usado para identificar novos arquivos.
     *
     * @type {string}
     */
    let newFileName = null;



    /**
     * Inicia um novo node de edição para um arquivo.
     *
     * @param {object} fileData
     */
    let openNewFileNode = (fileData) => {
        if (fileData === undefined) {
            fileData = {
                fullName: '',
                shortName: newFileName
            };
        }
        fileData.id = insertFiles.length;


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
            fileData = new insertFile(fileData);
            insertFiles.push(fileData);
            insertDOM.insertNewFileInDOM(fileData);
        }
    };





    let p = this.Control = {
        /**
         * Define o nome a ser usado para novos arquivos.
         *
         * @param {string} s
         */
        setNewFileName: (s) => {
            if (newFileName === null) {
                newFileName = s;
            }
        },


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
            /*ipcRenderer.send(
                'dialogOpenFile',
                {
                    title: settings.locale.legend.dialogSelectFile,
                    defaultPath: settings.ini.defaultPath,
                    extensions: settings.ini.extensions
                }
            );*/
        },
        save: () => {
            /*ipcRenderer.send(
                'saveFile'
            );*/
        },
        saveAs: () => {

        },
        closeFile: (e) => {
            /*let useIndex = getFileIndex(e.target);
            let targetFile = openFiles[useIndex];
            targetFile.fileButton.parentNode.removeChild(targetFile.fileButton);
            targetFile.editNode.parentNode.removeChild(targetFile.editNode);
            openFiles.splice(useIndex, 1);


            // Reindexa todos os objetos da view
            if (openFiles.length > 0) {
                for (var it in openFiles) {
                    openFiles[it].fileButton.attributes['data-file-index'].value = it;
                    openFiles[it].editNode.attributes['data-file-index'].value = it;
                }
            }

            // Se há algum arquivo aberto e o arquivo encerrado era o que estava em foco
            if (openFiles.length > 0 && useIndex === targetFile) {
                if (useIndex > 0) { useIndex--; }
                selectFile(useIndex);
            }*/
        }
    };


    return p;
})();
