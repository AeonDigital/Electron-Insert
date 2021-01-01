'use strict';





/**
 * Classe que gera uma instância que representa um arquivo aberto no editor.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertFile = function (fileData) {





    /**
     * Identificador deste arquivo.
     *
     * @type {int}
     */
    let id = null;
    /**
     * Caminho completo até onde o arquivo originalmente está salvo.
     * DEVE ser definido quando está abrindo um arquivo existente.
     *
     * @type {string}
     */
    let fullName = '';
    /**
     * Nome do arquivo.
     * DEVE ser definido quando está abrindo um arquivo existente.
     *
     * @type {string}
     */
    let shortName = '';
    /**
     * Indica quando o arquivo é um novo documento.
     *
     * @type {bool}
     */
    let isNew = false;
    /**
     * Indica quando este arquivo está ou não em foco.
     *
     * @type {bool}
     */
    let hasFocus = false;


    /**
     * Node LI do seletor para o arquivo.
     *
     * @type {node}
     */
    let fileButton = null;
    /**
     * Node SPAN do seletor para o arquivo(onde está o evento de seleção do mesmo).
     *
     * @type {node}
     */
    let fileLabel = null;
    /**
     * Node SECTION editável onde o usuário pode editar o conteúdo do arquivo.
     *
     * @type {node}
     */
    let editNode = null;





    /**
     * Inicia uma nova representação de um arquivo para o editor.
     */
    let constructor = (fileData) => {
        id = fileData.id;
        fullName = fileData.fullName;
        shortName = fileData.shortName;
        isNew = fileData.isNew;
        fileButton = fileData.fileButton;
        fileLabel = fileData.fileLabel;
        editNode = fileData.editNode;

        insertFileCursor.addListenerFileNode(
            id,
            editNode,
            fileData.fileLabel,
            fileData.data
        );
    };










    let p = this.Control = {
        /**
         * Retorna o id do arquivo.
         *
         * @return {int}
         */
        getId: () => { return id; },
        /**
         * Retorna o nome completo do arquivo aberto.
         *
         * @return {string}
         */
        getFullName: () => { return fullName; },
        /**
         * Retorna o nome curto do arquivo aberto.
         *
         * @return {string}
         */
        getShortName: () => { return shortName; },
        /**
         * Retorna o estado atual do arquivo indicando se ele é novo (aberto novo arquivo e ainda não salvo).
         *
         * @return {bool}
         */
        getIsNew: () => { return isNew; },
        /**
         * Retorna 'true' caso este seja o arquivo que está em foco no momento.
         *
         * @return {bool}
         */
        getHasFocus: () => { return hasFocus; },



        /**
         * Define ou remove o foco deste arquivo.
         *
         * @param {bool} active
         */
        redefineFocus: (active) => {
            if (active === true) {
                fileButton.setAttribute('class', 'active');
                editNode.setAttribute('class', 'active');
                insertFileCursor.restoreCursorPosition(id);
            }
            else {
                fileButton.removeAttribute('class');
                editNode.removeAttribute('class');
            }
            hasFocus = active;
        },



        /**
         * Retorna o conteúdo atual do editor.
         *
         * @return {string}
         */
        getData: () => { return insertFileCursor.retrieveEditorStringData(id); },
        /**
         * Retorna 'true' caso existam modificações no arquivo que ainda não
         * tenham sido salvas.
         *
         * @return {bool}
         */
        getHasChanges: () => { return insertFileCursor.checkIfEditorHasChanges(id, false); },



        /**
         * Remove do DOM os nodes representantes deste arquivo.
         */
        remove: () => {
            fileButton.parentNode.removeChild(fileButton);
            editNode.parentNode.removeChild(editNode);

            insertFileCursor.removeListenerFileNode(id);
        },



        /**
         * Perssiste os dados que estão atualmente na view com os dados que estão
         * armazenados na propriedade 'data'.
         */
        save: () => {
            insertFileCursor.checkIfEditorHasChanges(id, true);
            isNew = false;
        },
        /**
         * Perssiste os dados que estão atualmente na view com os dados que estão
         * armazenados na propriedade 'data'.
         *
         * @param {string} newFullName
         * @param {string} newShortName
         */
        saveAs: (newFullName, newShortName) => {
            fullName = newFullName;
            shortName = newShortName;

            insertFileCursor.checkIfEditorHasChanges(id, true);
            isNew = false;
            fileLabel.innerHTML = shortName;
        }
    };




    // Inicia o objeto
    constructor(fileData);
    return p;
};
