'use strict';





/**
 * Coleções de ações do menu principal do ›Insert Editor.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertMenuActions = (() => {

    let p = this.Control = {
        /**
         * Abre um novo arquivo de texto.
         */
        new: () => {
            console.log('new');
            /*openFiles.push({
                fullName: '',
                shortName: '',
                data: '',
                fileButton: null,
                editNode: null
            });
            let useIndex = openFiles.length - 1;
            createSelectFileButton(settings.locale.legend.newfile, useIndex, true);
            createEditableNode(useIndex, '');
            selectFile(useIndex);*/
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
