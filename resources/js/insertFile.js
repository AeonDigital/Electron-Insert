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
     * Conteúdo total do arquivo referente à última versão salva.
     * DEVE ser definido quando está abrindo um arquivo existente.
     *
     * @type {string}
     */
    let data = '';
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
     *
     * @type {bool}
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
     * Inicia uma nova representação de um arquivo para o editor.
     */
    let constructor = (fileData) => {
        id = (fileData['id'] ?? null);
        fullName = (fileData['fullName'] ?? '');
        shortName = (fileData['shortName'] ?? '');
        data = (fileData['data'] ?? '');
        isNew = (fullName === '');

        if (id === null) {
            throw new Error("Invalid 'id' propertie defined in 'insertFile' constructor.");
        }

        let r = insertDOM.createSelectFileButton(
            shortName, isNew, id, fileData.evtFileSetFocus, fileData.evtFileClose
        );
        fileButton = r.fileButton;
        fileLabel = r.fileLabel;
        closeButton = r.closeButton;

        editNode = insertDOM.createEditableNode(id);

        document.getElementById('mainMenu').appendChild(fileButton);
        document.getElementById('mainPanel').appendChild(editNode);
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
         * Retorna 'true' caso o arquivo aberto seja novo e ainda
         * não tenha sido salvo.
         *
         * @return {bool}
         */
        getIsNew: () => { return isNew; },
        /**
         * Retorna 'true' caso existam modificações no arquivo que ainda não
         * tenham sido salvas.
         *
         * @return {bool}
         */
        getHasChanges: () => { return hasChanges; },
        /**
         * Retorna 'true' caso este seja o arquivo que está em foco no momento.
         *
         * @return {bool}
         */
        getInFocus: () => { return inFocus; },
        /**
         * Retorna um objeto contendo todos os nodes de controle importantes para
         * o respectivo arquivo.
         *
         * @return {bool}
         */
        getNodes: () => {
            return {
                fileButton: fileButton,
                fileLabel: fileLabel,
                closeButton: closeButton,
                editNode: editNode
            }
        },
        /**
         * Define ou remove o foco deste arquivo.
         *
         * @param {bool} active
         */
        redefineFocus: (active) => {
            if (active === true) {
                fileButton.setAttribute('class', 'active');
                editNode.setAttribute('class', 'active');
            }
            else {
                fileButton.removeAttribute('class');
                editNode.removeAttribute('class');
            }
            inFocus = active;
        }
    };




    // Inicia o objeto
    constructor(fileData);
    return p;
};
