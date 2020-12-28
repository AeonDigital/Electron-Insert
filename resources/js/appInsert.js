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
    let collectionOfInsertFiles = [];
    /**
     * Controle para o próximo id a ser usado para a abertura de um novo arquivo.
     *
     * @type {int}
     */
    let atualId = 0;
    /**
     * Mantém registro dos dados que permitem mover botões de seleção
     * de arquivos.
     *
     * @type {object}
     */
    let fileSelector = {
        /**
         * Area total visivel onde os botões seletores estão.
         *
         * @type {int}
         */
        stageWidth: 0,
        /**
         * Area total referente a todos os botões atualmente presentes.
         *
         * @type {int}
         */
        activeAreaWidth: 0,
        /**
         * Total de área disponível sem um botão ocupando este espaço.
         *
         * @type {int}
         */
        emptyAreaWidth: 0
    };










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

                        if (btn.attributes['data-btn-shortcut'] !== undefined) {
                            let sc = document.createElement('span');
                            sc.innerHTML = btn.attributes['data-btn-shortcut'].value;
                            btn.appendChild(sc);
                        }
                        break;
                }
            }
        });

        window.addEventListener('keydown', evtMainOnKeyDownListener);
    };
    /**
     * Evento que identifica quando um comando é dado via teclado.
     *
     * @param {evt} e
     */
    let evtMainOnKeyDownListener = (e) => {
        let cmd = null;

        if (e.ctrlKey || e.metaKey) {
            switch (String.fromCharCode(e.which).toLocaleLowerCase()) {
                case 'n':
                    cmd = 'cmdNew';
                    break;

                case 'o':
                    cmd = 'cmdOpen';
                    break;

                case 's':
                    cmd = 'cmdSave';
                    if (e.shiftKey) {
                        cmd = 'cmdSaveAs';
                    }
                    break;
            }
        }

        if (cmd !== null) {
            e.preventDefault();
            CMD[cmd]();
            return false;
        }
    };










    /**
     * Inicia um novo node de edição para um arquivo.
     *
     * @param {object} fileData
     */
    let addInsertFile = (fileData) => {
        atualId++;

        // Prepara os dados mínimos para a geração de uma representação de um
        // arquivo dentro da aplicação.
        if (fileData === undefined) {
            fileData = {
                fullName: '',
                shortName: appSettings.locale.button.newfile,
                data: '',
                isNew: true
            };
        }
        fileData.id = atualId;
        fileData.evtSetFocus = evtInsertFileSetFocus;
        fileData.evtClose = evtInsertFileClose;


        //
        // Se trata-se de um arquivo existente...
        // Não permite que o mesmo arquivo seja aberto 2x
        let isNewFile = true;
        if (fileData.fullName !== '' && collectionOfInsertFiles.length > 0) {
            for (let it in collectionOfInsertFiles) {
                if (collectionOfInsertFiles[it].getFullName() === fileData.fullName) {
                    isNewFile = false;
                }
            }
        }


        if (isNewFile === true) {
            let nodes = DOM.createSelectFileButton(
                fileData.shortName,
                fileData.id,
                fileData.evtSetFocus,
                fileData.evtClose
            );

            fileData.fileButton = nodes.fileButton;
            fileData.fileLabel = nodes.fileLabel;
            fileData.closeButton = nodes.closeButton;
            fileData.editNode = DOM.createEditableNode(fileData.id, fileData.data);


            collectionOfInsertFiles.push(new insertFile(fileData));
            document.getElementById('mainMenu').appendChild(fileData.fileButton);
            document.getElementById('mainPanel').appendChild(fileData.editNode);
            redefineFileSelectorProperties();

            evtInsertFileSetFocus({ target: fileData.id });
            insertCursor.setCursorPositionOnStart(fileData.id);
        }
    };
    /**
     * Retorna o objeto 'insertFile' correspondente ao id indicado.
     *
     * @param {int} id
     *
     * @return {insertFile}
     */
    let getInsertFileById = (id) => {
        let r = null;

        for (let it in collectionOfInsertFiles) {
            let file = collectionOfInsertFiles[it];

            if (file.getId() === id) {
                r = file;
            }
        }

        return r;
    };
    /**
     * Retorna o objeto 'insertFile' que está em foco no momento.
     *
     * @return {insertFile}
     */
    let getInsertFileInFocus = () => {
        let r = null;

        for (let it in collectionOfInsertFiles) {
            let file = collectionOfInsertFiles[it];

            if (file.getInFocus() === true) {
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
    let removeInsertFileById = (id) => {

        let removeFile = null;
        let removeFileIndex = 0;

        for (let it in collectionOfInsertFiles) {
            let file = collectionOfInsertFiles[it];

            if (file.getId() === id) {
                removeFile = file;
                removeFileIndex = parseInt(it);
            }
        }

        removeFile.remove();
        collectionOfInsertFiles.splice(removeFileIndex, 1);


        // Se o item removido é o que estava em foco e ainda há
        // algum arquivo aberto no editor
        if (removeFile.getInFocus() === true && collectionOfInsertFiles.length > 0) {
            // Se possível,
            // Promove o item na mesma posição do anterior para o foco.
            if (removeFileIndex >= collectionOfInsertFiles.length) {
                removeFileIndex = (collectionOfInsertFiles.length - 1);
            }
            evtInsertFileSetFocus({ target: collectionOfInsertFiles[removeFileIndex].getId() });
        }
    };










    /**
     * Fecha o arquivo selecionado.
     *
     * @param {evt} e
     */
    let evtInsertFileClose = (e) => {
        let id = DOM.getTargetFileId(e.target);
        let file = getInsertFileById(id);

        // Havendo alterações, oferece a opção para que o usuário possa
        // salvar o arquivo.
        let canClose = true;
        if (file.getHasChanges() === true) {
            canClose = confirmCloseWithoutSave(file.getShortName());
        }

        if (canClose === true) {
            removeInsertFileById(id);
        }
    };
    /**
     * Questiona o usuário sobre sair sem salvar o arquivo atualmente aberto que contem
     * alterações.
     *
     * @param {string} fileShortName
     */
    let confirmCloseWithoutSave = (fileShortName) => {
        let msg = appSettings.locale.CMD.cmdFileClose.confirmCloseWithoutSave.replace(
            '[[shortName]]', fileShortName
        );
        return confirm(msg);
    };










    /**
     * Redefine as propriedades que permitem controlar o movimento dos botões
     * seletores de arquivos.
     */
    let redefineFileSelectorProperties = () => {
        let menuWindow = document.getElementById('menuWindow');
        let buttons = DOM.querySelectorAll('#mainMenu > li');
        let activeAreaWidth = 0;

        buttons.forEach((btn) => {
            activeAreaWidth += btn.offsetWidth;
        });
        let emptyAreaWidth = (menuWindow.offsetWidth - activeAreaWidth);


        fileSelector.stageWidth = menuWindow.offsetWidth;
        fileSelector.activeAreaWidth = activeAreaWidth;
        fileSelector.emptyAreaWidth = ((emptyAreaWidth > 0) ? emptyAreaWidth : 0);
        console.log(fileSelector);
    };
    /**
     * Ajusta os botões das tabs referentes aos arquivos abertos para que
     * aquela que está selecionada apareça por completo.
     */
    let adjustFileSelectorButtonPosition = () => {
        if (fileSelector.emptyAreaWidth === 0) {
            let buttons = DOM.querySelectorAll('#mainMenu > li');

            if (buttons.length > 0) {
                let mainMenu = document.getElementById('mainMenu');
                let matchSelected = false;
                let offsetWidth = 0;
                let marginLeft = 0;


                buttons.forEach((btn) => {
                    if (matchSelected === false) {
                        if (btn.classList.contains('active') === true) {
                            matchSelected = true;
                        }

                        let offW = Math.ceil(parseFloat(window.getComputedStyle(btn).width.replace('px', ''))) + 1;
                        offsetWidth += offW;
                        if (offsetWidth > fileSelector.stageWidth) {
                            if (marginLeft === 0) {
                                marginLeft = offsetWidth - fileSelector.stageWidth;
                            }
                            else { marginLeft += offW; }
                        }
                    }
                });

                marginLeft = (marginLeft * -1);
                mainMenu.style['marginLeft'] = marginLeft + 'px';
            }
        }
    };





    /**
     * Define o foco para o arquivo selecionado.
     *
     * @param {evt} e
     */
    let evtInsertFileSetFocus = (e) => {
        let id = DOM.getTargetFileId(e.target);

        for (let it in collectionOfInsertFiles) {
            let file = collectionOfInsertFiles[it];
            if (file.getId() === id) {
                file.redefineFocus(true);
            }
            else {
                if (file.getInFocus() === true) {
                    file.redefineFocus(false);
                }
            }
        }

        adjustFileSelectorButtonPosition();
    };
    /**
     * Muda o foco do arquivo selecionado para o próximo na direção indicada.
     *
     * @param {string} dir
     */
    let evtMoveInsertFileSelectorFocus = (dir) => {
        let buttons = DOM.querySelectorAll('#mainMenu > li');
        let tgtIndex = null;
        let activeIndex = null;

        for (let it in buttons) {
            if (buttons[it].classList.contains('active') === true) {
                tgtIndex = parseInt(it);
                activeIndex = parseInt(it);

                if (dir === 'prev') {
                    tgtIndex--;
                    if (tgtIndex < 0) { tgtIndex = 0; }
                }
                else if (dir === 'next') {
                    tgtIndex++;
                    if (tgtIndex >= buttons.length) { tgtIndex = buttons.length - 1; }
                }
            }
        }

        if (tgtIndex !== activeIndex) {
            evtInsertFileSetFocus({ target: buttons[tgtIndex] });
        }
    };










    /**
     * Inicia o Editor.
     */
    let constructor = () => {
        setDefaultEventListeners();
        redefineFileSelectorProperties();
        onResizeEnd.addEventListener(redefineFileSelectorProperties);
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
         * @param {evt} evtSetFocus
         * @param {evt} evtClose
         *
         * @return {node[]}
         */
        createSelectFileButton: (fileName, id, evtSetFocus, evtClose) => {

            let li = document.createElement('li');
            li.setAttribute('data-file-id', id);

            let span = document.createElement('span');
            span.addEventListener('click', evtSetFocus);
            span.innerHTML = fileName;

            let btn = document.createElement('button');
            btn.setAttribute('type', 'button');
            btn.setAttribute('data-btn-action', 'closeFile');
            btn.addEventListener('click', evtClose);
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
                while (el !== null && el.attributes['data-file-id'] === undefined) {
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
            addInsertFile();
        },
        /**
         * Abre a janela de dialogo permitindo ao usuário selecionar um novo arquivo
         * para ser aberto no editor.
         */
        cmdOpen: () => {
            let fileData = ipcRenderer.sendSync(
                'cmdOpenSync', { appSettings: appSettings }
            );
            if (fileData !== undefined) {
                addInsertFile(fileData);
            }
        },
        /**
         * Salva o arquivo atualmente em foco se houverem alterações realizadas.
         */
        cmdSave: () => {
            let fileData = getInsertFileInFocus();
            if (fileData !== null) {

                if (fileData.getIsNew() === true) {
                    CMD.cmdSaveAs();
                }
                else if (fileData.getHasChanges() === true) {

                    let saveResult = ipcRenderer.sendSync(
                        'cmdSaveSync',
                        {
                            fullName: fileData.getFullName(),
                            data: fileData.getData()
                        }
                    );

                    if (saveResult === true) { fileData.save(); }
                    else {
                        alert(appSettings.locale.CMD.cmdSave.onFail.replace(
                            '[[shortName]]', fileData.getShortName()
                        ));
                    }
                }
            }
        },
        /**
         * Salva o arquivo atualmente em foco com um novo nome.
         */
        cmdSaveAs: () => {
            let fileData = getInsertFileInFocus();
            if (fileData !== null) {
                let saveResult = ipcRenderer.sendSync(
                    'cmdSaveAsSync',
                    {
                        appSettings: appSettings,
                        data: fileData.getData()
                    }
                );

                if (saveResult !== undefined) {
                    if (saveResult.success === true) {
                        fileData.saveAs(saveResult.fullName, saveResult.shortName);
                        adjustFileSelectorButtonPosition();
                    }
                    else {
                        alert(appSettings.locale.CMD.cmdSaveAs.onFail.replace(
                            '[[fullName]]', saveResult.fullName
                        ));
                    }
                }
            }
        },
        /**
         * Identifica se é possível encerrar a aplicação.
         * Em caso afirmativo, encerra-a
         */
        cmdCanClose: () => {
            _public.cmdCanClose();
        },
        /**
         * Movimenta os botões seletores de documentos 1 posição para traz.
         */
        cmdSelectPrev: () => {
            evtMoveInsertFileSelectorFocus('prev');
        },
        /**
         * Movimenta os botões seletores de documentos 1 posição para frente.
         */
        cmdSelectNext: () => {
            evtMoveInsertFileSelectorFocus('next');
        }
    };





    let _public = this.Control = {
        /**
         * Verifica se é possível fechar a aplicação sem salvar os arquivos abertos.
         *
         * @return {bool}
         */
        cmdCanClose: () => {
            let r = true;
            for (let it in collectionOfInsertFiles) {
                if (collectionOfInsertFiles[it].getHasChanges() === true) {
                    r = false;
                }
            }

            if (r === false) {
                r = confirm(appSettings.locale.CMD.cmdCanClose.dialogConfirmClose);
            }

            if (r === true) {
                ipcRenderer.sendSync('cmdCanCloseOk');
            }
        }
    };





    // Inicia o objeto
    window.onload = () => {
        constructor();
    };
    return _public;
})();
