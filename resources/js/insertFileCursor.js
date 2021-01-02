'use strict';





/**
 * Monitora todas as ações referentes ao cursor, teclado e alterações nos arquivos abertos.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertFileCursor = (() => {





    /**
     * Mantém uma coleção de objetos usados para monitorar os nodes da
     * respectiva coleção.
     *
     * @type {fileCursor[]}
     */
    let collectionOfFileCursor = [];





    /**
     * Identifica o objeto da coleção que corresponde ao de Id indicado.
     *
     * @param {int} id
     *
     * @return {fileCursor}
     */
    let getFileCursorById = (id) => {
        let fileCursor = null;

        for (let it in collectionOfFileCursor) {
            if (collectionOfFileCursor[it].id === id) {
                fileCursor = collectionOfFileCursor[it];
            }
        }

        return fileCursor;
    };
    /**
     * A partir de um elemento que disparou um evento identifica qual o
     * objeto 'fileCursor' correspondente ao mesmo.
     *
     * @param {node} node
     *
     * @return {fileCursor}
     */
    let getFileCursorByChildNode = (node) => {
        let fileCursor = null;

        let el = node;
        while (el !== null && el.attributes['data-file-id'] === undefined) {
            el = el.parentNode;
        }

        if (el !== null) {
            fileCursor = getFileCursorById(parseInt(el.attributes['data-file-id'].value));
        }

        return fileCursor;
    }










    /**
     * Prepara o conteúdo de uma string para ser usada dentro do editor.
     *
     * @param {string} str
     *
     * @return {string}
     */
    let sanitizeOriginalStringData = (oStr) => {
        let str = [];

        let strLines = oStr.split('\r').join('').split('\n');
        for (let it in strLines) {
            if (strLines[it] === '') {
                str.push('');
            }
            else {
                str.push(strLines[it]);
            }
        }

        return str.join('\n');
    };
    /**
     * Resgata toda informação textual que está no node passado
     * e trata seu conteúdo para que ele seja plenamente compatível com um documento de texto.
     *
     * @param {node} node
     *
     * @returns {string}
     */
    let sanitizeViewStringData = (node) => {
        let str = [];


        // Para cada objeto filho do objeto passado
        for (var it in node.childNodes) {
            let pElem = node.childNodes[it];

            if (pElem.nodeType === Node.TEXT_NODE) {
                let p = document.createElement('p');
                p.textContent = pElem.textContent;
                pElem = p;
            }

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
                                // Como os navegadores sempre adicionam um <br /> ao final do elemento <p>
                                // o mesmo é ignorado quando tal elemento é encontrado na última posição
                                // dos filhos do <p>.
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

                str.push(line.join(''));
            }
        }


        return str.join('\n');
    };
    /**
     * Redefine todo o conteúdo editável do editor baseado na informação atual de sua
     * propriedade 'data';
     *
     * @param {int} id
     * @param {bool} persist
     */
    let redefineViewStringData = (id, persist) => {
        let nodeCursor = getFileCursorById(id);

        if (nodeCursor !== null) {
            let dataLines = nodeCursor.data.split('\n');
            if (dataLines.length === 0) { dataLines.push(''); }

            for (let it in dataLines) {
                let p = document.createElement('p');

                if (dataLines[it] === '') { p.innerHTML = '<br />'; }
                else {
                    let l = convertStringToValidHTMLText(dataLines[it])
                        .split('   ').join('&nbsp; &nbsp;')
                        .split('  ').join(' &nbsp;');
                    console.log(l);
                    if (l[0] === ' ') { l = '&nbsp;' + l.substr(1); }
                    p.innerHTML = l + '<br />';
                }

                nodeCursor.editNode.appendChild(p);
            }

            if (persist === true) {
                nodeCursor.data = sanitizeViewStringData(nodeCursor.editNode);
            }
        }
    };
    /**
     * A partir de uma string inicial, prepara a mesma para ser inserida no corpo
     * de um node editável.
     *
     * @param {str} str
     *
     * @return {string}
     */
    let convertStringToValidHTMLText = (str) => {
        let regex = /[<|>]/g;

        return str.replace(regex, (match) => {
            if (match === "<") { return "&lt;" }
            else if (match === ">") { return "&gt;"; }
        });
    };










    /**
     * Registro do último objeto 'event' que foi acionado na ação 'keyUp';
     *
     * @type {evt}
     */
    let lastKeyUpEvent = null;
    /**
     * Registra um evento 'checkIfHasChanges'.
     *
     * @type {timeOutEvt}
     */
    let timeout_checkIfHasChanges = null;
    /**
     * Evento acionado a cada 'keyUp' ocorrido no editor em foco.
     * Se não for interrompido por outro evento deste mesmo tipo irá disparar
     * a verificação que identifica alterações no respectivo editor.
     *
     * @param {evt} e
     */
    let setTimeout_checkIfHasChanges = (e) => {
        lastKeyUpEvent = e;
        clearTimeout(timeout_checkIfHasChanges);
        timeout_checkIfHasChanges = setTimeout(checkIfHasChanges, 500);
    };
    /**
     * Verifica se há alterações entre a última versão salva do arquivo aberto e a versão
     * atualmente apresentada.
     *
     * @param {bool} persist
     *              Quando 'true' forçará a redefinição atual do arquivo para que ele
     *              seja consistente com a atual versão.
     *
     * @return {bool}
     */
    let checkIfHasChanges = (persist) => {
        let nodeCursor = getFileCursorByChildNode(lastKeyUpEvent.target);

        let newData = sanitizeViewStringData(nodeCursor.editNode);
        if (persist === true) { nodeCursor.data = newData; }

        let r = (nodeCursor.data !== newData);

        let lbl = nodeCursor.fileLabel.innerText.replace(' *', '');
        nodeCursor.fileLabel.innerText = lbl + ((r === true) ? ' *' : '');

        return r;
    };










    /**
     * Salva uma cópia do objeto 'Range' referente a seleção atual do cursor para o objeto
     * que está sendo monitorado.
     *
     * @param {evt} e
     */
    let onKeyUpSaveCursorPosition = (e) => {
        let nodeCursor = getFileCursorByChildNode(e.target);

        // Encontrando o objeto alvo e ele estando apto para receber atualizações
        // de seu cursor e seleção...
        if (nodeCursor !== null) {
            nodeCursor.rangeSelection = document.getSelection().getRangeAt(0).cloneRange();
            appInsert.cmdSetRecentFileRangeSelection(nodeCursor.id, nodeCursor.rangeSelection);
        }
    };
    /**
     * Evento que intercepta uma ação de "colar".
     *
     * Efetua a limpeza de quaisquer marcações HTML que estejam sendo inseridas via
     * comando "colar".
     *
     * @param {evt} e
     */
    let evtOnPaste = (e) => {
        let nodeCursor = getFileCursorByChildNode(e.target);

        if (nodeCursor !== null) {
            e.preventDefault();

            let useStrLines = sanitizeOriginalStringData(e.clipboardData.getData('text/plain')).split('\n');
            if (useStrLines.length > 0) {
                let div = document.createElement('div');
                for (let it in useStrLines) {
                    let p = document.createElement('p');
                    p.innerHTML = useStrLines[it].split(' ').join('&nbsp;') + '<br />';
                    div.appendChild(p);
                }

                document.execCommand('insertHTML', false, div.innerHTML);
            }
        }
    };
    /**
     * Evento que intercepta uma ação de "copiar|recortar".
     *
     * Limpa a seleção para que o formato de saída seja compatível com aquilo que se está
     * visualizando.
     *
     * @param {evt} e
     */
    let evtOnCopyOrCut = (e) => {
        let nodeCursor = getFileCursorByChildNode(e.target);

        if (nodeCursor !== null) {
            if (e.type === 'copy') {
                e.preventDefault();
            }

            e.clipboardData.setData(
                'Text',
                sanitizeViewStringData(
                    document.getSelection().getRangeAt(0).cloneContents()
                )
            );
        }
    };










    let p = this.Control = {
        /**
         * Adiciona um novo node de editor que deve ter seus eventos monitorados.
         *
         * @param {int} id
         * @param {node} editNode
         * @param {node} fileLabel
         * @param {string} initialData
         * @param {Range} rangeSelection
         *
         * @return {bool}
         */
        addListenerFileNode: (id, editNode, fileLabel, initialData, rangeSelection) => {
            let r = false;
            let nodeCursor = getFileCursorById(id);

            if (nodeCursor === null && editNode.nodeType === Node.ELEMENT_NODE) {
                initialData = sanitizeOriginalStringData(initialData);

                collectionOfFileCursor.push({
                    /**
                     * Id Identificador do objeto
                     *
                     * @type {int}
                     */
                    id: id,
                    /**
                     * Node editável.
                     *
                     * @type {node}
                     */
                    editNode: editNode,
                    /**
                     * Node que carrega o nome atual do arquivo aberto.
                     *
                     * @type {node}
                     */
                    fileLabel: fileLabel,
                    /**
                     * Informação atualmente salva referente a este objeto.
                     *
                     * @type {string}
                     */
                    data: initialData,
                    /**
                     * Estado atual do cursor deste documento.
                     *
                     * @type {Selection}
                     */
                    rangeSelection: rangeSelection
                });



                redefineViewStringData(id, true);
                editNode.addEventListener('keyup', setTimeout_checkIfHasChanges);
                editNode.addEventListener('keyup', onKeyUpSaveCursorPosition);
                editNode.addEventListener('mouseup', onKeyUpSaveCursorPosition);

                editNode.addEventListener('paste', evtOnPaste);
                editNode.addEventListener('copy', evtOnCopyOrCut);
                editNode.addEventListener('cut', evtOnCopyOrCut);
            }

            return r;
        },
        /**
         * Remove da atual coleção o item que monitora o editor de id passado.
         *
         * @param {int} id
         */
        removeListenerFileNode: (id) => {
            let index = null;

            for (var it in collectionOfFileCursor) {
                if (collectionOfFileCursor[it].id === id) {
                    index = parseInt(it);
                }
            }

            if (index !== null) {
                collectionOfFileCursor.splice(index, 1);
            }
        },
        /**
         * Define no cursor 'Range' no documento.
         *
         * @param {Range} range
         */
        setCursorPosition: (range) => {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(range);
        },
        /**
         * Restaura a posição do cursor que está registrado para o node de id indicado.
         *
         * @param {string} id
         */
        restoreCursorPosition: (id) => {
            let nodeCursor = getFileCursorById(id);

            if (nodeCursor !== null) {
                // Se nenhuma posição for encontrada, define a primeira posição possível
                // como sendo a inicial.
                if ((nodeCursor.rangeSelection instanceof Range) === false) {
                    let range = new Range();
                    range.setStart(nodeCursor.editNode.firstElementChild, 0);
                    range.setEnd(nodeCursor.editNode.firstElementChild, 0);

                    appSettings.ini.recentFileList.files.forEach((fileCfg) => {
                        let fileFullName = nodeCursor.fileLabel.attributes['data-file-fullname'].value;
                        if (fileFullName === fileCfg[0] && fileCfg[2] !== null) {
                            let iniP = nodeCursor.editNode.querySelectorAll('p')[fileCfg[2].iniNode];
                            let endP = nodeCursor.editNode.querySelectorAll('p')[fileCfg[2].endNode];

                            let iniNode = iniP.childNodes[0];
                            let iniOffSet = fileCfg[2].iniOffSet;
                            let endNode = endP.childNodes[0];
                            let endOffSet = fileCfg[2].endOffSet;

                            range.setStart(iniNode, iniOffSet);
                            range.setEnd(endNode, endOffSet);

                            iniP.scrollIntoView({ block: "end" });
                        }
                    });

                    nodeCursor.rangeSelection = range;
                }

                insertFileCursor.setCursorPosition(nodeCursor.rangeSelection);

            }
        },
        /**
         * Retorna a string que representa o documento de id passado.
         *
         * @param {int} id
         *
         * @return {string}
         */
        retrieveEditorStringData: (id) => {
            let str = null;
            let nodeCursor = getFileCursorById(id);

            if (nodeCursor !== null) {
                str = sanitizeViewStringData(nodeCursor.editNode);
            }
            return str;
        },
        /**
         * Verifica se o documento de id indicado possui alguma alteração não salva.
         *
         * @param {int} id
         * @param {bool} persist
         *              Quando 'true' forçará a redefinição atual do arquivo para que ele
         *              seja consistente com a atual versão.
         */
        checkIfEditorHasChanges: (id, persist) => {
            let r = null;
            let nodeCursor = getFileCursorById(id);

            if (nodeCursor !== null) {
                clearTimeout(timeout_checkIfHasChanges);
                lastKeyUpEvent = { target: nodeCursor.editNode };
                r = checkIfHasChanges(persist);
            }

            return r;
        }
    };





    return p;
})();
