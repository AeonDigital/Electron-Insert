'use strict';





/**
 * Responsável por criar instâncias que representam um arquivo aberto
 * no editor.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertFile = function (fileData) {



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
     * Conteúdo total do arquivo referente à última versão salva.
     * DEVE ser definido quando está abrindo um arquivo existente.
     *
     * @type {string}
     */
    let data = '';
    /**
     * Conteúdo atual do arquivo conforme está sendo apresentado no editor.
     *
     * @type {string}
     */
    let ndata = '';
    /**
     * Indica quando trata-se de um arquivo que ainda não foi salvo.
     *
     * @type {bool}
     */
    let isNew = true;
    /**
     * Indica quando há ou não alteração realizada no documento e que ainda não foi salva
     *
     * @type {bool}
     */
    let hasChanges = false;
    /**
     * Indica quando este arquivo está ou não em foco.
     */
    let inFocus = false;
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
     * Node BUTTON do seletor para o arquivo(onde está o evento de fechamento do mesmo).
     *
     * @type {node}
     */
    let closeButton = null;
    /**
     * Node SECTION editável onde o usuário pode editar o conteúdo do arquivo.
     *
     * @type {node}
     */
    let editNode = null;





    /**
     * Inicia todos os documentos atualmente definidos no corpo do editor.
     */
    let constructor = (fileData) => {
        if (fileData !== undefined) {
            fullName = (fileInfo['fullName'] ?? '');
            shortName = (fileInfo['shortName'] ?? '');
            data = (fileInfo['data'] ?? '');
            ndata = data;
            isNew = (fullName === '');
        }

        let el = insertDOM.createSelectFileButton(shortName, isNew);
        fileButton = r.fileButton;
        fileLabel = r.fileLabel;
        closeButton = r.closeButton;

        editNode = insertDOM.createEditableNode();
    };





    // Inicia o objeto
    constructor(fileData);
    //return p;
};
