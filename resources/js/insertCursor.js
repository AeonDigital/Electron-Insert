'use strict';





/**
 * Permite monitorar o cursor selection de uma área editável do DOM mantendo registro
 * de seu estado e permitindo redefini-la caso necessário.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertCursor = (() => {





    /**
     * Mantém uma coleção de objetos usados para monitorar os nodes da
     * respectiva coleção.
     *
     * @type {nodeCursor[]}
     */
    let collectionOfNodeCursor = [];





    /**
     * Identifica o objeto da coleção que corresponde ao de Id indicado.
     *
     * @param {string} id
     *
     * @return {nodeCursor}
     */
    let getNodeCursorById = (id) => {
        let nodeCursor = null;

        for (let it in collectionOfNodeCursor) {
            if (collectionOfNodeCursor[it].id === id.toString()) {
                nodeCursor = collectionOfNodeCursor[it];
            }
        }

        return nodeCursor;
    };
    /**
     * A partir de um elemento que disparou um evento identifica qual o
     * objeto 'nodeCursor' correspondente ao mesmo.
     *
     * @param {node} node
     *
     * @return {nodeCursor}
     */
    let getNodeCursorByChildNode = (node) => {
        let nodeCursor = null;

        let el = node;
        while (el !== null && el.attributes['data-file-id'] === undefined) {
            el = el.parentNode;
        }

        if (el !== null) {
            nodeCursor = getNodeCursorById(el.attributes['data-file-id'].value);
        }

        return nodeCursor;
    }













    /**
     * Salva a posição atual do cursor e respectiva seleção para o objeto
     * que está sendo monitorado.
     *
     * @param {evt} e
     */
    let onKeyUpSaveCursorPosition = (e) => {
        let nodeCursor = getNodeCursorByChildNode(e.target);

        // Encontrando o objeto alvo e ele estando apto para receber atualizações
        // de seu cursor e seleção...
        if (nodeCursor !== null && nodeCursor.selectionLocked === false) {
            let cP = document.getSelection();

            nodeCursor.selectionStartNode = cP.anchorNode;
            nodeCursor.selectionStartNodeOffset = cP.anchorOffset;
            nodeCursor.selectionEndNode = cP.focusNode;
            nodeCursor.selectionEndNodeOffset = cP.focusOffset;
        }
    };
    /**
     * Quando um node monitorado perde o foco fica definido que a posição
     * do cursor e seleção não podem mais ser atualizados.
     *
     * @param {evt} e
     */
    let onBlurLockCursorPosition = (e) => {
        let nodeCursor = getNodeCursorByChildNode(e.target);

        if (nodeCursor !== null) {
            nodeCursor.selectionLocked = true;
        }
    };
    /**
     * Define o cursor e seleção no documento atual conforme as indicações do objeto
     * passado.
     *
     * @param {nodeCursor} nodeCursor
     */
    let setCursorPosition = (nodeCursor) => {
        let selectionStartNode = nodeCursor.selectionStartNode;
        let selectionStartNodeOffset = nodeCursor.selectionStartNodeOffset;
        let selectionEndNode = nodeCursor.selectionEndNode;
        let selectionEndNodeOffset = nodeCursor.selectionEndNodeOffset;

        let inverted = (
            (selectionStartNode === selectionEndNode && selectionStartNodeOffset > selectionEndNodeOffset) ||
            (selectionStartNode !== selectionEndNode && selectionStartNode.compareDocumentPosition(selectionEndNode) === 2)
        );

        // Se trata-se de uma seleção reversa...
        // ajusta a posição dos valores para permitir que a mesma não se perca.
        if (inverted === true) {
            selectionStartNode = nodeCursor.selectionEndNode;
            selectionStartNodeOffset = nodeCursor.selectionEndNodeOffset;
            selectionEndNode = nodeCursor.selectionStartNode;
            selectionEndNodeOffset = nodeCursor.selectionStartNodeOffset;
        }

        let useRange = new Range();
        useRange.setStart(selectionStartNode, selectionStartNodeOffset);
        useRange.setEnd(selectionEndNode, selectionEndNodeOffset);
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(useRange);
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
        let nodeCursor = getNodeCursorByChildNode(e.target);

        if (nodeCursor !== null) {
            e.preventDefault();

            let lines = e.clipboardData.getData('text/plain').split('\r').join('').split('\n');
            if (lines.length > 0) {
                let html = [];
                for (var it in lines) {
                    let p = document.createElement('p');
                    p.innerHTML = lines[it].split(' ').join('&nbsp;');
                    html.push(p.outerHTML);
                }

                document.execCommand('insertHTML', false, html.join(''));
                nodeCursor.selectionLocked = false;
            }
        }
    };











    let p = this.Control = {
        /**
         * Adiciona um novo node que deve ter seu cursor monitorado.
         *
         * @param {string} id
         * @param {node} editNode
         *
         * @return {bool}
         */
        addListenerNode: (id, editNode) => {
            let r = false;
            let nodeCursor = getNodeCursorById(id);

            if (nodeCursor === null && editNode.nodeType === Node.ELEMENT_NODE) {
                collectionOfNodeCursor.push({
                    id: id.toString(),
                    editNode: editNode,
                    /**
                     * Indica quando a instância está apta a seguir atualizando as
                     * propriedades de localização do range.
                     *
                     * @type {bool}
                     */
                    selectionLocked: false,
                    /**
                     * Node onde a seleção deve iniciar.
                     *
                     * Pela natureza do objeto 'Range' este deve SEMPRE preceder a posição no DOM
                     * do node 'selectionEndNode';
                     *
                     * @type {node}
                     */
                    selectionStartNode: null,
                    /**
                     * Posição na qual o cursor deve iniciar a seleção.
                     *
                     * @type {int}
                     */
                    selectionStartNodeOffset: null,
                    /**
                     * Node onde a seleção deve encerrar.
                     *
                     * Pela natureza do objeto 'Range' este deve SEMPRE suceder a posição no DOM
                     * do node 'selectionStartNode';
                     *
                     * @type {node}
                     */
                    selectionEndNode: null,
                    /**
                     * Posição na qual o cursor deve finalizar a seleção.
                     *
                     * @type {int}
                     */
                    selectionEndNodeOffset: null,
                });

                editNode.addEventListener('keyup', onKeyUpSaveCursorPosition);
                editNode.addEventListener('mouseup', onKeyUpSaveCursorPosition);
                editNode.addEventListener('blur', onBlurLockCursorPosition);
                editNode.addEventListener('paste', evtOnPaste);
            }

            return r;
        },
        /**
         * Restaura a posição do cursor que está registrado para o node de
         * id indicado.
         *
         * @param {string} id
         */
        restoreCursorPosition: (id) => {
            let nodeCursor = getNodeCursorById(id);

            if (nodeCursor !== null) {
                if (nodeCursor.selectionStartNode !== null) {
                    setCursorPosition(nodeCursor);
                    nodeCursor.selectionLocked = false;
                }
            }
        },
        /**
         * Restaura a posição do cursor para o início do documento.
         *
         * @param {string} id
         */
        setCursorPositionOnStart: (id) => {
            let nodeCursor = getNodeCursorById(id);

            if (nodeCursor !== null) {
                let tgtNode = nodeCursor.editNode.firstElementChild;
                if (tgtNode !== null) {
                    setCursorPosition({
                        selectionStartNode: tgtNode,
                        selectionStartNodeOffset: 0,
                        selectionEndNode: tgtNode,
                        selectionEndNodeOffset: 0
                    });
                }
            }
        },
        /**
         * Restaura a posição do cursor para o final do documento.
         *
         * @param {string} id
         */
        setCursorPositionOnEnd: (id) => {
            let nodeCursor = getNodeCursorById(id);

            if (nodeCursor !== null) {
                let tgtNode = nodeCursor.editNode.lastElementChild;
                if (tgtNode !== null) {
                    setCursorPosition({
                        selectionStartNode: tgtNode,
                        selectionStartNodeOffset: tgtNode.textContent.length,
                        selectionEndNode: tgtNode,
                        selectionEndNodeOffset: tgtNode.textContent.length
                    });
                }
            }
        }
    };




    return p;
})();
