'use strict';





/**
 * Modulo de controle do editor.
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
     * Armazena as informações necessárias para o controle de cada um dos arquivos
     * que estão abertos no momento.
     */
    let openFiles = [];
    /**
     * índice do arquivo atualmente em foco.
     */
    let selectedFile = null;







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
     * A partir de um elemento que disparou um evento identifica qual o
     * índice do arquivo correspondente ao mesmo.
     *
     * @param {node} node
     *
     * @return {int}
     */
    let getFileIndex = (node) => {
        let el = node;
        while (el.attributes['data-file-index'] === undefined) {
            el = el.parentNode;
        }

        return parseInt(el.attributes['data-file-index'].value);
    };










    /**
     * Inicia todos os documentos atualmente definidos no corpo do editor.
     */
    let constructor = (sett) => {
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




    let sanitizeData = (data) => {
        // Recebe uma string e converte qualquer entidade X/HTML em uma versão compatível com
        // o editor de textos.
        return data;
    };
    let checkChanges = (useIndex) => {
        openFiles[useIndex].ndata = sanitizeData(openFiles[useIndex].editNode.innerHTML);
        openFiles[useIndex].hasChanges = (openFiles[useIndex].ndata !== openFiles[useIndex].data);

        let lbl = openFiles[useIndex].fileLabel.innerText.replace(' *', '');
        if (openFiles[useIndex].hasChanges === true) {
            lbl += ' *';
        }
        openFiles[useIndex].fileLabel.innerHTML = lbl;
        return openFiles[useIndex].hasChanges;
    };





    /**
     * Eventos que serão definidos para cada botão correspondente.
     */
    let actions = {
        /**
         * Seleciona o documento que deve estar em foco.
         */
        selectFile: (e) => {
            selectFile(getFileIndex(e.target));
        },
        /**
         * Abre um novo arquivo de texto.
         */
        new: () => {
            openFiles.push({
                fullName: '',
                shortName: '',
                data: '',
                fileButton: null,
                editNode: null
            });
            let useIndex = openFiles.length - 1;
            createSelectFileButton(settings.locale.legend.newfile, useIndex, true);
            createEditableNode(useIndex, '');
            selectFile(useIndex);
        },
        /**
         * Abre a janela de dialogo permitindo ao usuário selecionar um novo arquivo
         * para ser aberto no editor.
         */
        open: () => {
            ipcRenderer.send(
                'dialogOpenFile',
                {
                    title: settings.locale.legend.dialogSelectFile,
                    defaultPath: settings.ini.defaultPath,
                    extensions: settings.ini.extensions
                }
            );
        },
        save: () => {
            ipcRenderer.send(
                'saveFile'
            );
        },
        saveAs: () => {

        },
        closeFile: (e) => {
            let useIndex = getFileIndex(e.target);
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
            }
        },
        selectPrev: () => {
            //selectByDirection('prev');
        },
        selectNext: () => {
            //selectByDirection('next');
        }
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
