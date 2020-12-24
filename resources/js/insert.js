'use strict';





/**
 * Modulo de controle do ›Insert Editor.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insert = function(sett) {



    /**
     * Coleção de nodes do DOM que podem ser afetados pelas
     * opções de marcação oferecidas pela barra de controles.
     */
    let settings = null;
    /**
     * Armazena a coleção de objetos 'insertFile' que correspondem a cada um dos
     * documentos atualmente abertos no ›Insert Editor.
     *
     * @type {insertFile[]}
     */
    let insertFiles = [];





    /**
     * Inicia todos os documentos atualmente definidos no corpo do ›Insert Editor.
     */
    let constructor = (sett) => {
        settings = sett;
        insertDOM.setDefaultEventListeners(settings.locale.button);
    };





    let p = this.Control = {
        openFile: (fileData) => {
            // verifica se o arquivo já não está aberto.
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
            }
        }
    };



    // Inicia o objeto
    constructor(sett);
    return p;
};
