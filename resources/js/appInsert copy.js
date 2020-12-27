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
     * Coleção de objetos que armazenam as informações necessárias para recuperar a
     * posição do cursor quando um documento ganhar o foco novamente.
     *
     * @type {object}
     */
    let cursorPositions = {};





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

        window.addEventListener('keydown', onKeyDownCMD);
    };
    /**
     * Evento que identifica quando um comando é dado via teclado.
     *
     * @param {evt} e
     */
    let onKeyDownCMD = (e) => {
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
    let openNewFileNode = (fileData) => {
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

        evtOnFileSetFocusRestoreCursorPosition(id);
    };
    /**
     * Quando um documento perder o foco por qualquer motivo, a posição atual do cursor
     * será armazenada para futura recuperação.
     *
     * @param {evt} e
     */
    let onKeyUpSaveCursorPosition = (e) => {
        let id = DOM.getTargetFileId(e.target);
        console.log('save in', id);

        // Apenas se ainda não há um objeto deste tipo salvo.
        // impede desta forma que seja sobresctida a informação sobre um
        // mesmo documento.
        if (cursorPositions[id] === undefined || cursorPositions[id].locked === false) {
            let cP = document.getSelection();

            // Mantém a formação da seleção sempre do primeiro node para o último.
            let startNode = cP.anchorNode;
            let startOffset = cP.anchorOffset;
            let endNode = cP.focusNode;
            let endOffset = cP.focusOffset;

            // Se trata-se de uma seleção reversa...
            if (startNode === endNode && startOffset > endOffset) {
                console.log('reverse');
                startNode = cP.focusNode;
                startOffset = cP.focusOffset;
                endNode = cP.anchorNode;
                endOffset = cP.anchorOffset;
            }

            cursorPositions[id] = {
                node: e.target,
                locked: false,
                anchorNode: startNode,
                anchorOffset: startOffset,
                focusNode: endNode,
                focusOffset: endOffset
            };
            console.log('save', id);
            console.log(cursorPositions[id]);
        }
    };
    let onBlurLockCursorPosition = (e) => {
        let id = DOM.getTargetFileId(e.target);
        if (cursorPositions[id] !== undefined) {
            cursorPositions[id].locked = true;
        }
    };
    /**
     * Permite que a posição do cursor de um documento seja recuperada quando o mesmo
     * retomar o foco da aplicação.
     *
     * @param {int} id
     */
    let evtOnFileSetFocusRestoreCursorPosition = (id) => {
        let cP = cursorPositions[id];
        let resetRange = new Range();

        console.log('restore', id);
        if (cP === undefined) {
            let p = DOM.querySelectorAll('main > section.active p')[0];
            resetRange.setStart(p, 0);
            resetRange.setEnd(p, 0);
            console.log('zero', id);
        }
        else {
            resetRange.setStart(cP.anchorNode, cP.anchorOffset);
            resetRange.setEnd(cP.focusNode, cP.focusOffset);
            console.log(cP);
            cursorPositions[id].locked = false;
        }

        document.getSelection().removeAllRanges();
        document.getSelection().addRange(resetRange);
        console.log('exec', id);
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
     * Efetua a limpeza de quaisquer marcações HTML que estejam sendo inseridas via
     * comando "colar"
     *
     * @param {evt} e
     */
    let evtOnPaste = (e) => {
        e.preventDefault();
        let id = DOM.getTargetFileId(e.target);

        let lines = e.clipboardData.getData('text/plain').split('\r').join('').split('\n');
        if (lines.length > 0) {
            let html = [];
            let lastP = null;
            for (var it in lines) {
                let p = document.createElement('p');
                p.innerHTML = lines[it].split(' ').join('&nbsp;');
                html.push(p.outerHTML);
                lastP = p;
            }

            document.execCommand('insertHTML', false, html.join(''));
            cursorPositions[id].locked = false;
            //onKeyUpSaveCursorPosition({ target: lastP});
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
     * Inicia o Editor.
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
            section.addEventListener('paste', evtOnPaste);
            section.addEventListener('keyup', onKeyUpSaveCursorPosition);
            section.addEventListener('mouseup', onKeyUpSaveCursorPosition);
            section.addEventListener('blur', onBlurLockCursorPosition);

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
                if (el === null) {
                    console.log('falhou em', node);
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
        cmdOpen: () => {
            let fileData = ipcRenderer.sendSync(
                'cmdOpenSync', { appSettings: appSettings }
            );
            if (fileData !== undefined) {
                openNewFileNode(fileData);
            }
        },
        /**
         * Salva o arquivo atualmente em foco se houverem alterações realizadas.
         */
        cmdSave: () => {
            let fileData = selectFileObjectInFocus();
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
            let fileData = selectFileObjectInFocus();
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
            for (let it in insertFiles) {
                if (insertFiles[it].getHasChanges() === true) {
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
