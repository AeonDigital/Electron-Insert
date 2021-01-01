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
        DOM.querySelectorAll('[data-btn-action]').forEach((btn) => {
            let actName = btn.attributes['data-btn-action'].value;

            if (CMD[actName] !== undefined) {
                btn.addEventListener('click', CMD[actName]);
            }
        });

        window.addEventListener('keydown', evtMainOnKeyDownListener);
        onResizeEnd.addEventListener(redefineFileSelectorProperties);
    };
    /**
     * Evento que identifica quando um comando é dado via teclado.
     *
     * @param {evt} e
     */
    let evtMainOnKeyDownListener = (e) => {

        if (e.ctrlKey === true || e.metaKey === true) {
            let cmd = null;

            switch (e.key.toLocaleLowerCase()) {
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

            if (cmd !== null) {
                e.preventDefault();
                CMD[cmd]();
                return false;
            }
        }
        else if (e.shiftKey === true && e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '<p></p>');
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


        // Apenas se for um arquivo que ainda não está
        // aberto no editor
        if (isNewFile === true) {
            let nodes = DOM.createSelectFileButton(
                fileData.fullName,
                fileData.shortName,
                fileData.id,
                fileData.evtSetFocus,
                fileData.evtClose
            );

            fileData.fileButton = nodes.fileButton;
            fileData.fileLabel = nodes.fileLabel;
            fileData.closeButton = nodes.closeButton;
            fileData.editNode = DOM.createEditableNode(fileData.id);


            collectionOfInsertFiles.push(new insertFile(fileData));
            document.getElementById('mainMenu').appendChild(fileData.fileButton);
            document.getElementById('mainPanel').appendChild(fileData.editNode);
            redefineFileSelectorProperties();

            evtInsertFileSetFocus({ target: fileData.id });
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

            if (file.getHasFocus() === true) { r = file; }
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
        if (removeFile.getHasFocus() === true && collectionOfInsertFiles.length > 0) {
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

        insertConfig.cmdSaveConfigurations();
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
                if (file.getHasFocus() === true) {
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
     * Indica quando as ações de abrir e salvar arquivos podem redefinir a lista de
     * arquivos recentes.
     */
    let canRecreateRecentList = false;
    /**
     * Baseado na lista dos últimos arquivos abertos preenche o menu de opções recentes
     * e o menu de opções "favoritados".
     */
    let setRecentFileList = () => {
        let recentList = document.getElementById('recentList');
        let favoriteList = document.getElementById('favoriteList');

        // Remove todos os nodes filhos
        recentList.querySelectorAll('*').forEach((n) => { n.remove() });
        favoriteList.querySelectorAll('*').forEach((n) => { n.remove() });

        // Para cada item na lista, adiciona um novo node nos respectivos menus
        appSettings.ini.recentFileList.files.forEach((fileCfg) => {
            let li = DOM.createRecentFile(fileCfg[0], fileCfg[1]);

            if (fileCfg[1] === false) { recentList.appendChild(li); }
            else { favoriteList.appendChild(li); }
        });

        insertConfig.cmdSaveConfigurations();
    };
    /**
     * Sempre que um arquivo for aberto ou "salvo como", seu nome deverá ir para a o
     * primeiro item da lista de arquivos recentes.
     *
     * @param {string} fullName
     * @param {bool} recreateRecentList
     */
    let addRecentFile = (fullName, recreateRecentList) => {
        let fileIndex = null;
        let favList = [];
        let recList = [];

        // verifica se o arquivo indicado já não existe na lista
        appSettings.ini.recentFileList.files.forEach((fileCfg, i) => {
            if (fileCfg[0] === fullName) {
                fileIndex = i;
            }

            if (fileCfg[1] === true) { favList.push(fileCfg); }
            else { recList.push(fileCfg); }
        });


        if (fileIndex === null) {
            recList.unshift([
                fullName, false, null
            ]);

            // Mantém a lista de itens recentes com o máximo de itens permitidos para a mesma.
            // itens "favoritados" não entram nesta contagem.
            if (recList.length > appSettings.ini.recentFileList.maxFiles) {
                recList = recList.slice(0, appSettings.ini.recentFileList.maxFiles);
            }

            // redefine a lista de recentes.
            appSettings.ini.recentFileList.files = favList.concat(recList);
        }
        else {
            let item = appSettings.ini.recentFileList.files.splice(fileIndex, 1)[0];
            appSettings.ini.recentFileList.files.unshift(item);
        }


        if (recreateRecentList === true) {
            setRecentFileList();
        }
    };
    /**
     * Abre os arquivos que estão na lista de favoritos.
     * Esta ação é executada apenas 1 vez.
     */
    let openRecentFiles = () => {
        if (canRecreateRecentList === false) {

            document.querySelectorAll('#favoriteList > li').forEach((cmdLI) => {
                CMD.cmdOpenFile({ target: cmdLI });
            });

            canRecreateRecentList = true;
        }
    };










    /**
     * Inicia o Editor.
     */
    let constructor = () => {
        setDefaultEventListeners();
        redefineFileSelectorProperties();
        setRecentFileList();

        insertConfig.init();
        openRecentFiles();
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
         * @param {string} fullName
         * @param {string} fileName
         * @param {int} id
         * @param {evt} evtSetFocus
         * @param {evt} evtClose
         *
         * @return {node[]}
         */
        createSelectFileButton: (fullName, fileName, id, evtSetFocus, evtClose) => {

            let li = document.createElement('li');
            li.setAttribute('data-file-id', id);

            let span = document.createElement('span');
            span.addEventListener('click', evtSetFocus);
            span.setAttribute('data-file-fullname', fullName);
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
         *
         * @return {node}
         */
        createEditableNode: (id) => {
            let section = document.createElement('section');
            section.setAttribute('data-panel', 'editor-document');
            section.setAttribute('contenteditable', 'true');
            section.setAttribute('data-file-id', id);
            section.setAttribute('spellcheck', appSettings.ini.spellcheck);

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
        },
        /**
         * Cria uma node <li> para ser adicionado em uma das listas de itens recentes.
         *
         * @param {string} fullName
         * @param {bool} isFav
         *
         * @return {node}
         */
        createRecentFile: (fullName, isFav) => {
            let li = document.createElement('li');
            li.setAttribute('data-btn-action-arg', fullName);

            let btnOpenFile = document.createElement('button');
            btnOpenFile.setAttribute('type', 'button');
            btnOpenFile.setAttribute('data-btn-action', 'cmdOpenFile');
            btnOpenFile.setAttribute('title', fullName);
            btnOpenFile.innerHTML = fullName.split('/').pop();
            btnOpenFile.addEventListener('click', CMD.cmdOpenFile);


            let btnFavorite = document.createElement('button');
            btnFavorite.setAttribute('type', 'button');
            btnFavorite.setAttribute('data-btn-action', 'cmdToggleFavorite');
            btnFavorite.setAttribute('data-label-locale-button',
                ((isFav === false) ? 'cmdAddFavorite' : 'cmdRemoveFavorites')
            );
            btnFavorite.setAttribute('data-label-type', 'title');
            btnFavorite.setAttribute('class',
                ((isFav === false) ? 'ico-d3' : 'ico-d3 active')
            );
            btnFavorite.setAttribute('title',
                ((isFav === false) ? appSettings.locale.button.cmdAddFavorite : appSettings.locale.button.cmdRemoveFavorite)
            );
            btnFavorite.addEventListener('click', CMD.cmdToggleFavorite);


            let imgNoHover = document.createElement('img');
            imgNoHover.setAttribute('src', '../../resources/icons/star.png');
            imgNoHover.setAttribute('class', 'no-hover');
            imgNoHover.setAttribute('alt', '');

            let imgOnHover = document.createElement('img');
            imgOnHover.setAttribute('src', '../../resources/icons/star-bg.png');
            imgOnHover.setAttribute('class', 'on-hover');
            imgOnHover.setAttribute('alt', '');


            btnFavorite.appendChild(imgNoHover);
            btnFavorite.appendChild(imgOnHover);
            li.appendChild(btnOpenFile);
            li.appendChild(btnFavorite);

            return li;
        },
        /**
         * Retorna o elemento <li> que foi acionado para abrir um arquivo recente.
         *
         * @param {node} node
         *
         * @return {node}
         */
        getOpenFileLI: (node) => {
            let li = node;
            while (li !== null && li.tagName !== 'LI' && li.attributes['data-btn-action-arg'] === undefined) {
                li = li.parentNode;
            }

            return ((li.tagName === 'LI' && li.attributes['data-btn-action-arg'] !== undefined) ? li : null);
        },
        /**
         * Retorna o elemento <button> que foi acionado para adicionar/remover um arquivo
         * da lista de favoritos.
         *
         * @param {node} node
         *
         * @return {node}
         */
        getFavButton: (node) => {
            let btn = node;
            while (btn !== null && btn.tagName !== 'BUTTON') {
                btn = btn.parentNode;
            }
            return btn;
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
                addRecentFile(fileData.fullName, canRecreateRecentList);
            }
        },
        /**
         * Abre o arquivo referente ao botão que foi clicado.
         */
        cmdOpenFile: (e) => {
            let cmdLI = DOM.getOpenFileLI(e.target);

            if (cmdLI !== null) {
                let fullName = cmdLI.attributes['data-btn-action-arg'].value;

                let fileData = ipcRenderer.sendSync(
                    'cmdOpenFileSync', fullName
                );


                // Se não foi possível abrir o arquivo, remove o mesmo da respectiva lista
                if (fileData === null) {
                    cmdLI.parentNode.remove(cmdLI);
                    alert(appSettings.locale.CMD.cmdOpenFile.onFail.replace(
                        '[[fullName]]', fullName
                    ));
                }
                else {
                    addInsertFile(fileData);
                    addRecentFile(fileData.fullName, canRecreateRecentList);
                }
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
                        addRecentFile(fileData.getFullName(), canRecreateRecentList);
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
            insertConfig.cmdSaveConfigurations();
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
        },
        /**
         * Abre o painel de configurações do editor.
         */
        cmdOpenSettings: () => {
            document.getElementById('mainAside').classList.toggle('open');
        },
        /**
         * Adiciona ou remove o item da lista de favoritos.
         */
        cmdToggleFavorite: (e) => {
            let cmdLI = DOM.getOpenFileLI(e.target);
            let cmdBtn = DOM.getFavButton(e.target);

            if (cmdLI !== null && cmdBtn !== null) {
                let fullName = cmdLI.attributes['data-btn-action-arg'].value;

                // Se o arquivo ainda não está na lista dos favoritos, adiciona-o.
                // se estiver, remove-o
                appSettings.ini.recentFileList.files.forEach((fileCfg, i) => {
                    if (fileCfg[0] === fullName) {
                        fileCfg[1] = (cmdBtn.classList.contains('active') === false);
                    }
                });

                setRecentFileList();
            }
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
        },
        /**
         * Define nas informações do arquivos recentes a posição atual do objeto
         * Range para o arquivo de id passado, permitindo assim que esta posição
         * seja resgatada ao reabrir o editor.
         *
         * @param {int} id
         * @param {Range} range
         */
        cmdSetRecentFileRangeSelection: (id, range) => {
            let file = getInsertFileById(id);

            if (file !== null) {
                appSettings.ini.recentFileList.files.forEach((fileCfg, i) => {
                    if (fileCfg[0] === file.getFullName()) {
                        let iniN = range.startContainer;
                        while (iniN !== null && iniN.nodeType !== Node.ELEMENT_NODE && iniN.tagName !== 'P') {
                            iniN = iniN.parentElement;
                        }

                        let endN = range.endContainer;
                        while (endN !== null && endN.nodeType !== Node.ELEMENT_NODE && endN.tagName !== 'P') {
                            endN = endN.parentElement;
                        }

                        if (iniN !== null && endN !== null) {
                            let parentChildren = iniN.parentNode.children;
                            let iniI = Array.prototype.indexOf.call(parentChildren, iniN);
                            let endI = Array.prototype.indexOf.call(parentChildren, endN);

                            let iniNode = iniI;
                            let iniOffSet = range.startOffset;
                            let endNode = endI;
                            let endOffSet = range.endOffset;

                            if (iniNode > endNode) {
                                iniNode = endI;
                                iniOffSet = endOffSet;
                                endNode = iniI;
                                endOffSet = iniOffSet;
                            }

                            appSettings.ini.recentFileList.files[i][2] = {
                                iniNode: iniNode,
                                iniOffSet: iniOffSet,
                                endNode: endNode,
                                endOffSet: endOffSet
                            };
                        }
                    }
                });
            }
        }
    };





    // Inicia o objeto
    window.onload = () => {
        constructor();
    };
    return _public;
})();
