'use strict';





/**
 * Gerencia os elementos do DOM.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertDOM = (() => {



    /**
     * Indica quando o ›Insert Editor já houver sido iniciado impedindo assim
     * que algumas ações sejam realizadas mais de 1 vez.
     *
     * @param {bool}
     */
    let initialized = false;



    let p = this.Control = {
        /**
         * Wrapper para o método "document.querySelectorAll" que já filtra os
         * objetos retornados para que apenas sejam listados elementos do DOM.
         *
         * @param {string} seletor
         *
         * @returns {Node[]}
         */
        querySelectorAll: (seletor) => {
            let nodeList = document.querySelectorAll(seletor);

            if (nodeList.length === 0) {
                nodeList = [];
            }
            else {
                let nL = [];
                for (let it in nodeList) {
                    let n = nodeList[it];
                    if (typeof (n) === 'object' && n.tagName !== undefined) {
                        nL.push(n);
                    }
                }
                nodeList = nL;
            }
            return nodeList;
        },
        /**
         * Prepara os botões fixos do editor.
         *
         * @param {object} buttonLabels
         */
        setDefaultEventListeners: (buttonLabels) => {
            if (initialized === false) {
                initialized = true;

                // Inicia as ações e legenda de cada um dos botões
                p.querySelectorAll('[data-btn-action]').forEach((btn) => {
                    let actName = btn.attributes['data-btn-action'].value;
                    let lblType = btn.attributes['data-btn-label'];
                    lblType = (lblType === undefined) ? 'title' : lblType.value;

                    if (insertMenuActions[actName] !== undefined) {
                        btn.addEventListener('click', insertMenuActions[actName]);
                    }

                    if (buttonLabels[actName] !== undefined) {
                        let lbl = buttonLabels[actName];

                        switch (lblType) {
                            case 'title':
                                btn.setAttribute('title', lbl);
                                break;
                            case 'inside':
                                btn.innerHTML = lbl;
                                break;
                        }
                    }
                });

            }
        },
        /**
         * Gera um botão que identifica um arquivo aberto no ›Insert Editor.
         * Retorna a coleção de nodes que o formam.
         *
         * @param {string} fileName
         * @param {bool} isNew
         *
         * @return {node[]}
         */
        createSelectFileButton: (fileName, isNew) => {
            if (isNew === true) {
                fileName += ' *';
            }

            let li = document.createElement('li');

            let span = document.createElement('span');
            span.innerHTML = fileName;

            let btn = document.createElement('button');
            btn.setAttribute('type', 'button');
            btn.setAttribute('data-btn-action', 'closeFile');
            btn.innerHTML = 'X';


            li.appendChild(span);
            li.appendChild(btn);

            return {
                fileButton: li,
                fileLabel: span,
                closeButton: btn
            };
        },
        /**
         * Gera um node <section> que conterá o conteúdo do documento que se planeja
         * permitir editar.
         *
         * @return {node}
         */
        createEditableNode: () => {
            let section = document.createElement('section');
            section.setAttribute('data-panel', 'editor-document');
            section.setAttribute('contenteditable', 'true');

            return section;
        },
        /**
         * A partir de um elemento que disparou um evento identifica qual o
         * índice do arquivo correspondente ao mesmo.
         *
         * @param {node} node
         *
         * @return {int}
         */
        getTargetFileIndex: (node) => {
            let el = node;
            while (el.attributes['data-file-index'] === undefined) {
                el = el.parentNode;
            }

            return parseInt(el.attributes['data-file-index'].value);
        }
    };


    return p;
})();
