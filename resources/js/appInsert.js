'use strict';





/**
 * Modulo principal.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
const appInsert = (() => {




    /**
     * Armazena a coleção de objetos 'insertFile' que correspondem a cada um dos
     * documentos atualmente abertos no editor.
     *
     * @type {insertFile[]}
     */
    let insertFiles = [];
    /**
     * Controle para o próximo id a ser usado para a abertura de um novo arquivo.
     *
     * @type {int}
     */
    let atualId = 0;





    /**
     * Prepara os botões fixos do editor.
     */
    let setDefaultEventListeners = () => {
        // Inicia as ações e legenda de cada um dos botões
        DOM.querySelectorAll('[data-btn-action]').forEach((btn) => {
            let actName = btn.attributes['data-btn-action'].value;
            let lblType = btn.attributes['data-btn-label'];
            lblType = (lblType === undefined) ? 'title' : lblType.value;

            if (CMD[actName] !== undefined) {
                btn.addEventListener('click', CMD[actName]);
            }

            if (appSettings.locale.button[actName] !== undefined) {
                let lbl = appSettings.locale.button[actName];

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
    };










    /**
     * Inicia um novo node de edição para um arquivo.
     *
     * @param {object} fileData
     */
    let openNewFileNode = (fileData) => {
        atualId++;

        // Prepara os dados mínimos para a geração de uma representação de um
        // arquivo dentro da aplicação.
        if (fileData === undefined) {
            fileData = {
                fullName: '',
                shortName: appSettings.locale.legend.newfile,
                data: ''
            };
        }
        fileData.id = atualId;
        fileData.evtFileSetFocus = evtFileSetFocus;
        fileData.evtFileClose = evtFileClose;


        //
        // Se trata-se de um arquivo existente...
        // Não permite que o mesmo arquivo seja aberto 2x
        let isNewFile = true;
        if (fileData.fullName !== '' && insertFiles.length > 0) {
            for (let it in insertFiles) {
                if (insertFiles[it].getFullName() === fileData.fullName) {
                    isNewFile = false;
                }
            }
        }


        if (isNewFile === true) {
            let nodes = DOM.createSelectFileButton(
                fileData.shortName,
                fileData.id,
                fileData.evtFileSetFocus,
                fileData.evtFileClose
            );

            fileData.fileButton = nodes.fileButton;
            fileData.fileLabel = nodes.fileLabel;
            fileData.closeButton = nodes.closeButton;
            fileData.editNode = DOM.createEditableNode(fileData.id, fileData.data);


            insertFiles.push(new insertFile(fileData));
            document.getElementById('mainMenu').appendChild(fileData.fileButton);
            document.getElementById('mainPanel').appendChild(fileData.editNode);

            evtFileSetFocus({ target: fileData.id });
        }
    };
    /**
     * Retorna o objeto 'insertFile' correspondente ao id indicado.
     *
     * @param {int} id
     *
     * @return {insertFile}
     */
    let selectFileObjectById = (id) => {
        let r = null;

        for (let it in insertFiles) {
            let file = insertFiles[it];

            if (file.getId() === id) {
                r = file;
            }
        }

        return r;
    };
    /**
     * Remove o objeto 'insertFile' da coleção de itens abertos e também
     * remove seus respectivos nodes do DOM.
     *
     * @param {int} id
     *
     * @return {insertFile}
     */
    let removeFileObjectById = (id) => {

        let removeFile = null;
        let removeFileIndex = 0;

        for (let it in insertFiles) {
            let file = insertFiles[it];

            if (file.getId() === id) {
                removeFile = file;
                removeFileIndex = parseInt(it);
            }
        }

        removeFile.remove();
        insertFiles.splice(removeFileIndex, 1);


        // Se o item removido é o que estava em foco e ainda há
        // algum arquivo aberto no editor
        if (removeFile.getInFocus() === true && insertFiles.length > 0) {
            // Se possível,
            // Promove o item na mesma posição do anterior para o foco.
            if (removeFileIndex >= insertFiles.length) {
                removeFileIndex = (insertFiles.length - 1);
            }
            evtFileSetFocus({ target: insertFiles[removeFileIndex].getId() });
        }
    };
    /**
     * Retorna o objeto 'insertFile' que está em foco no momento.
     *
     * @return {?insertFile}
     */
    let selectFileObjectInFocus = () => {
        let r = null;

        for (let it in insertFiles) {
            let file = insertFiles[it];

            if (file.getInFocus() === true) {
                r = file;
            }
        }

        return r;
    };





    /**
     * Define o foco para o arquivo selecionado.
     *
     * @param {evt} e
     */
    let evtFileSetFocus = (e) => {
        let id = DOM.getTargetFileId(e.target);

        for (let it in insertFiles) {
            let file = insertFiles[it];
            if (file.getId() === id) {
                file.redefineFocus(true);
            }
            else {
                if (file.getInFocus() === true) {
                    file.redefineFocus(false);
                }
            }
        }
    };
    /**
     * Fecha o arquivo selecionado.
     *
     * @param {evt} e
     */
    let evtFileClose = (e) => {
        let id = DOM.getTargetFileId(e.target);
        let file = selectFileObjectById(id);

        // Havendo alterações, oferece a opção para que o usuário possa
        // salvar o arquivo.
        let canClose = true;
        if (file.getHasChanges() === true) {
            canClose = confirmCloseWithoutSave(file.getShortName());
        }

        if (canClose === true) {
            removeFileObjectById(id);
        }
    };





    /**
     * Questiona o usuário sobre sair sem salvar o arquivo atualmente aberto que contem
     * alterações.
     *
     * @param {string} fileShortName
     */
    let confirmCloseWithoutSave = (fileShortName) => {
        let msg = appSettings.locale.legend.dialogConfirmCloseWithoutSave.replace(
            '[[shortName]]', fileShortName
        );
        return confirm(msg);
    };










    /**
     * Inicia o ›Insert Editor.
     */
    let constructor = () => {
        setDefaultEventListeners();
    };





    let DOM = {
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
                    if (n.nodeType === Node.ELEMENT_NODE) {
                        nL.push(n);
                    }
                }
                nodeList = nL;
            }
            return nodeList;
        },




        /**
         * Gera um botão que identifica um arquivo aberto no editor.
         * Retorna a coleção de nodes que o formam.
         *
         * @param {string} fileName
         * @param {int} id
         * @param {evt} evtFileSetFocus
         * @param {evt} evtFileClose
         *
         * @return {node[]}
         */
        createSelectFileButton: (fileName, id, evtFileSetFocus, evtFileClose) => {

            let li = document.createElement('li');
            li.setAttribute('data-file-id', id);

            let span = document.createElement('span');
            span.addEventListener('click', evtFileSetFocus);
            span.innerHTML = fileName;

            let btn = document.createElement('button');
            btn.setAttribute('type', 'button');
            btn.setAttribute('data-btn-action', 'closeFile');
            btn.addEventListener('click', evtFileClose);
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
         * @param {int} id
         * @param {string} data
         *
         * @return {node}
         */
        createEditableNode: (id, data) => {
            let section = document.createElement('section');
            section.setAttribute('data-panel', 'editor-document');
            section.setAttribute('contenteditable', 'true');
            section.setAttribute('data-file-id', id);
            section.setAttribute('spellcheck', appSettings.ini.spellcheck);

            let dataLines = data.split('\n');
            for (let it in dataLines) {
                let p = document.createElement('p');
                p.innerText = dataLines[it];

                section.appendChild(p);
            }

            return section;
        },
        /**
         * A partir de um elemento que disparou um evento identifica qual o
         * id do arquivo correspondente ao mesmo.
         *
         * @param {node|int} node
         *
         * @return {int}
         */
        getTargetFileId: (node) => {
            if (isNaN(node) === false) {
                return parseInt(node);
            }
            else {
                let el = node;
                while (el.attributes['data-file-id'] === undefined) {
                    el = el.parentNode;
                }

                return parseInt(el.attributes['data-file-id'].value);
            }
        }
    };




    let CMD = {
        /**
         * Abre um novo arquivo de texto.
         */
        cmdNew: () => {
            openNewFileNode();
        },
        /**
         * Abre a janela de dialogo permitindo ao usuário selecionar um novo arquivo
         * para ser aberto no editor.
         */
        cmdOpen: (e) => {
            if (e.target === undefined) {
                openNewFileNode(e);
            }
            else {
                ipcRenderer.send(
                    'dialogOpenFile',
                    {
                        title: appSettings.locale.legend.dialogSelectFile,
                        defaultPath: appSettings.ini.defaultPath,
                        extensions: appSettings.ini.extensions
                    }
                );
            }
        },
        /**
         * Salva o arquivo atualmente em foco se houverem alterações realizadas.
         */
        cmdSave: () => {
            let file = selectFileObjectInFocus();
            if (file !== null && file.getHasChanges() === true) {
                ipcRenderer.send('save', file);
            }
        },
        /**
         * Salva o arquivo atualmente em foco com um novo nome.
         */
        cmdSaveAs: () => {
            let file = selectFileObjectInFocus();
            if (file !== null) {
                ipcRenderer.send('saveAs', file);
            }
        },
        cmdCloseApp: () => {
            console.log('closeApp');
        }
    };





    let _public = this.Control = {
        cmdOpen: (fileData) => {
            CMD.cmdOpen(fileData);
        }
    };





    // Inicia o objeto
    window.onload = () => {
        constructor();
    };

    return _public;
})();
