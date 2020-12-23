'use strict';





/**
 * Responsável por criar instâncias que representam um arquivo aberto
 * no editor.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertFile = function(sett, fileData) {



    /**
     * Dados do documento aberto.
     */
    let info = {
        /**
         * Caminho completo até onde o arquivo originalmente está salvo.
         *
         * @type {string}
         */
        fullName: '',
        /**
         * Nome do arquivo.
         *
         * @type {string}
         */
        shortName: '',
        /**
         * Conteúdo total do arquivo referente à  última versão salva.
         *
         * @type {string}
         */
        data: '',
        /**
         * Conteúdo atual do arquivo conforme está sendo apresentado no editor.
         *
         * @type {string}
         */
        ndata: '',
        /**
         * Indica quando trata-se de um arquivo que ainda não foi salvo.
         *
         * @type {bool}
         */
        isNew: true,
        /**
         * Indica quando há ou não alteração realizada no documento e que ainda não foi salva
         *
         * @type {bool}
         */
        hasChanges: false,
        /**
         * Indica quando este arquivo está ou não em foco.
         */
        inFocus: false,
        /**
         * Node LI do seletor para o arquivo.
         *
         * @type {node}
         */
        fileButton: null,
        /**
         * Node SPAN do seletor para o arquivo(onde está o evento de seleção do mesmo).
         *
         * @type {node}
         */
        fileLabel: null,
        /**
         * Node BUTTON do seletor para o arquivo(onde está o evento de fechamento do mesmo).
         *
         * @type {node}
         */
        closeButton: null,
        /**
         * Node SECTION editável onde o usuário pode editar o conteúdo do arquivo.
         *
         * @type {node}
         */
        editNode: null,
    };







    /**
     * Wrapper para o método "document.querySelectorAll" que já filtra os
     * objetos retornados para que apenas sejam listados elementos do DOM.
     *
     * @param {string} seletor
     *
     * @returns {Node[]}
     */
    let querySelectorAll = (seletor) => {
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
    };











    /**
     * Inicia todos os documentos atualmente definidos no corpo do editor.
     */
    let constructor = (sett, fileData) => {
        settings = sett;


        // Inicia as ações e legenda de cada um dos botões
        querySelectorAll('[data-btn-action]').forEach((btn) => {
            let actName = btn.attributes['data-btn-action'].value;
            let lblType = btn.attributes['data-btn-label'];
            lblType = (lblType === undefined) ? 'title' : lblType.value;

            if (actions[actName] !== undefined) {
                btn.addEventListener('click', actions[actName]);
            }
            if (settings.locale.button[actName] !== undefined) {
                let lbl = settings.locale.button[actName];
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


        // Abre um novo arquivo vazio.
        actions.new();
    };









    let createSelectFileButton = (newFileStr, useIndex, isNew) => {
        let li = document.createElement('li');
        li.setAttribute('data-file-name', '');
        li.setAttribute('data-file-index', useIndex);

        let span = document.createElement('span');
        span.addEventListener('click', actions['selectFile']);
        span.innerHTML = newFileStr;
        if (isNew === true) {
            span.innerHTML += ' *';
        }

        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('data-btn-action', 'closeFile');
        btn.addEventListener('click', actions['closeFile']);
        btn.innerHTML = 'X';

        li.appendChild(span);
        li.appendChild(btn);

        document.getElementById('menuFile').appendChild(li);
        openFiles[useIndex].fileButton = li;
        openFiles[useIndex].fileLabel = span;
        openFiles[useIndex].closeButton = btn;
        openFiles[useIndex].isNew = isNew;
    };
    let createEditableNode = (useIndex, data) => {
        let section = document.createElement('section');
        section.setAttribute('data-panel', 'editor-document');
        section.setAttribute('data-file-index', useIndex);
        section.setAttribute('contenteditable', 'true');
        section.setAttribute('spellcheck', settings.ini.spellcheck.toString());

        // Preenche o conteúdo
        data = data.split('\n');
        if (data.length === 0) { data.push(' '); }
        for (let it in data) {
            let p = document.createElement('p');
            p.innerHTML = data[it];
            section.appendChild(p);
        }

        document.getElementById('mainPanel').appendChild(section);
        openFiles[useIndex].editNode = section;
        openFiles[useIndex].hasChanges = false;
    };
    let selectFile = (useIndex) => {
        let i = useIndex.toString();

        querySelectorAll('#menuFile > li').forEach((li) => {
            li.removeAttribute('class');
            if (li.attributes['data-file-index'].value === i) {
                li.setAttribute('class', 'active');
            }
        });
        querySelectorAll('#mainPanel > section').forEach((section) => {
            section.setAttribute('hidden', '');
            if (section.attributes['data-file-index'].value === i) {
                section.removeAttribute('hidden');
            }
        });

        selectedFile = useIndex;
    };




    // Inicia o objeto
    constructor(sett, fileData);
    //return p;
};
