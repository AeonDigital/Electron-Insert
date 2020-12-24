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
            shortName, id, fileData.evtFileSetFocus, fileData.evtFileClose
        );
        fileButton = r.fileButton;
        fileLabel = r.fileLabel;
        closeButton = r.closeButton;

        editNode = insertDOM.createEditableNode(id, data);

        document.getElementById('mainMenu').appendChild(fileButton);
        document.getElementById('mainPanel').appendChild(editNode);
    };





    /**
     * Verifica se há alterações entre o arquivo originalmente aberto e a versão
     * atualmente apresentada na tela.
     */
    let checkIfHasChanges = () => {
        let ndata = [];
        for (var it in editNode.childNodes) {
            let pElem = editNode.childNodes[it];

            // Apenas se trata-se mesmo de um elemento P
            if (pElem.nodeType === Node.ELEMENT_NODE && pElem.tagName === 'P') {
                let line = [];

                // Se o paragrafo está vazio...
                if (pElem.innerText === '') {
                    line.push('');
                }
                else {
                    // Para cada node filho do elemento P
                    for (var ii in pElem.childNodes) {
                        let pChild = pElem.childNodes[ii];

                        // Se o tipo do node for de texto, adiciona o mesmo
                        // no coletor de dados do parágrafo atual.
                        if (pChild.nodeType === Node.TEXT_NODE) {
                            line.push(pChild.textContent);
                        }
                        // Senão, tratando-se de um outro tipo de elemento...
                        else if (pChild.nodeType === Node.ELEMENT_NODE) {
                            switch (pChild.tagName) {
                                case 'BR':
                                    if (pChild !== pElem.lastChild) {
                                        line.push('\n');
                                    }
                                    break;
                                default:
                                    line.push(pChild.textContent);
                                    break;
                            }
                        }
                    }
                }

                ndata.push(line.join(''));
            }
        }

        ndata = ndata.join('\n');
        hasChanges = (data !== ndata);

        let lbl = fileLabel.innerText.replace(' *', '').trim();
        if (hasChanges === true) {
            lbl += ' *';
        }
        fileLabel.innerText = lbl;

        return hasChanges;
    };


    let timeout_checkIfHasChanges = null;
    let setTimeout_checkIfHasChanges = () => {
        clearTimeout(timeout_checkIfHasChanges);
        timeout_checkIfHasChanges = setTimeout(checkIfHasChanges, 500);
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
         *
        getIsNew: () => { return isNew; },
        /**
         * Retorna 'true' caso existam modificações no arquivo que ainda não
         * tenham sido salvas.
         *
         * @return {bool}
         */
        getHasChanges: () => {
            clearTimeout(timeout_checkIfHasChanges);
            checkIfHasChanges();
            return hasChanges;
        },
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
         *
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
                editNode.addEventListener('keyup', setTimeout_checkIfHasChanges);
            }
            else {
                fileButton.removeAttribute('class');
                editNode.removeAttribute('class');
                editNode.removeEventListener('keyup', setTimeout_checkIfHasChanges);
            }
            inFocus = active;
        },
        /**
         * Remove do DOM os nodes representantes deste arquivo.
         */
        remove: () => {
            fileButton.parentNode.removeChild(fileButton);
            editNode.parentNode.removeChild(editNode);
        }
    };




    // Inicia o objeto
    constructor(fileData);
    return p;
};
