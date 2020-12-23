/**
 * Classe que controla a interface da aplicação.
 */
var insert = function () {
    /**
     * Configurações da aplicação.
     */
    let settings = {
        /**
         * Diretório padrão onde os arquivos são salvos.
         */
        workDirectory: null,
        /**
         * Locale sendo usado pelo editor.
         */
        locale: 'pt-BR',
        /**
         * Indica se deve ou não ativar a verificação ortográfica.
         */
        spellcheck: false,
        /**
         * Identifica que tipo de filesystem será usado.
         */
        fileSystem: (('chooseFileSystemEntries' in window) ? 'native' : 'legacy'),
        /**
         * Informações referentes a interface
         */
        interface: {
            /**
             * Representa a lista de arquivos atualmente aberta.
             */
            fileList: {
                /**
                 * Posição onde a lista de arquivos aberto deve aparecer.
                 */
                position: 'top',
                /**
                 * Arquivos atualmente abertos.
                 */
                files: [],
                /**
                 * Coleção de nodes que compõe a lista de arquivos.
                 */
                node: {
                    /**
                     * Div principal que mostra os botões de arquivos que estão disponíveis.
                     */
                    stage: null,
                    /**
                     * Botões
                     */
                    button: {
                        /**
                         * Node principal, onde os botões são alocados.
                         */
                        node: null,
                        /**
                         * Coleção de botões atualmente definidos.
                         */
                        collection: [],
                    },
                    /**
                     * Textareas
                     */
                    textarea: {
                        /**
                         * Node principal, onde as textareas são alocadas.
                         */
                        node: null,
                        /**
                         * Coleções de textareas atualmente definidas.
                         */
                        collection: []
                    }
                },
                /**
                 * Informações referentes ao movimento das abas
                 */
                tabMove: {
                    /**
                     * Indice do arquivo atualmente selecionado
                     */
                    selected: null,
                    /**
                     * Largura total do espaço visível das tabs
                     */
                    stageW: null,
                    /**
                     * Largura total do div interno que conporta todos os botões lado a lado
                     * para que ocorra o scrool
                     */
                    canvasW: null,
                    /**
                     * Largura (em pixels) referente ao "canvasW" que não cabe na largura total
                     * do "stageW"
                     */
                    range: 0,
                    /**
                     * Posição atual do "canvasW" em relação ao "stageW"
                     */
                    position:0
                }
            },
        },
        language: {
            'pt-BR': {
                button: {
                    new: 'Novo Arquivo',
                    menu: 'Menu',
                    close: 'Fechar',

                    header1: 'Título 1',
                    header2: 'Título 2',
                    header3: 'Título 3',
                    header4: 'Título 4',
                    header5: 'Título 5',
                    header6: 'Título 6',

                    bold: 'Negrito',
                    italic: 'Itálico',
                    underline: 'Sublinhado',
                    strike: 'Tachado',
                },
                legend: {
                    newfile: 'Novo arquivo'
                }
            }
        }
    };





    /**
     * Efetua uma consulta no DOM pelo seletor CSS informado.
     *
     * @param   ?Node s
     *          Seletor CSS a ser usado.
     */
    let query = function (s) {
        let r = [];
        [].forEach.call(document.querySelectorAll(s), function (n) { r.push(n); });
        return r;
    };
    /**
     * Executa o evento.
     *
     * @param   {string} n
     *          Categoria.
     *
     * @param   {string} e
     *          Ação.
     *
     * @param   {string} t
     *          Text.
     */
    let gaEvent = function(n, e, t) {
        window.ga && window.ga('send', 'event', {
            eventCategory: n,
            eventAction: e
        });
    };





    let fileSystem = {
        native: {
            openFile: async function () {
                let e = null;
                let a = null;
                gaEvent('FileAction', 'Open', 'Legacy');
            },
            getFileHandle: function () {
                return window.chooseFileSystemEntries();
            },
            readFile: function (e) {
                return e.text();
            }
        },
        legacy: {
            node: {
                input: null,
                download: null
            },
            openFile: async function () {
                fileSystem.legacy.node.input.click();
                fileSystem.legacy.node.input.onchange = function (evt) {
                    var files = evt.target.files;

                    for (var i = 0, f; f = files[i]; i++) {
                        var reader = new FileReader();
                        reader.onload = (function (theFile) {
                            return function (e) {
                                settings.interface.fileList.node.textarea.collection[
                                    settings.interface.fileList.selected
                                ].textarea.value = e.target.result;
                            };
                        })(f);
                        reader.readAsText(f, 'UTF-8');
                    }
                };


                // Read in the image file as a data URL.
                /*reader.readAsDataURL(f);
                gaEvent('FileAction', 'Open', 'Legacy');
                let e = await fileSystem.legacy.getFile();

                if (e) {
                    try {
                        fileSystem.setText(await readFile(e));
                    } catch (err) {
                        gaEvent("Error", "FileRead", err.name);
                        alert('Ocorreu um erro ao ler o arquivo selecionado');
                    }
                }*/
            },
            getFile: function () {
                return new Promise(function (e, n) {
                    fileSystem.legacy.node.input.onchange = function (c) {
                        const o = fileSystem.legacy.node.input.files[0];
                        o ? e(o) : n(new Error("AbortError"));
                    };
                    fileSystem.legacy.node.input.click();
                });
            },
            readFile: function (e) {
                return new Promise(function (t) {
                    const i = new FileReader;
                    i.addEventListener("loadend", function (e) {
                        const i = e.srcElement.result;
                        t(i);
                    });
                    i.readAsText(e);
                });
            }
        },
        setText: function (t) {
            settings.interface.fileList.node.textarea.collection[
                settings.interface.fileList.selected
            ].value = t;
        }
    }






    /**
     * Inicia os controles da interface.
     */
    let initi = function () {
        let fileListNode = settings.interface.fileList.node;

        query('[data-btn-action]').forEach(function (btn) {
            let attr = btn.attributes['data-btn-action'].value;

            if (actions[attr] !== undefined) {
                btn.addEventListener('click', actions[attr]);
            }
            if (settings.language[settings.locale].button[attr] !== undefined) {
                btn.setAttribute('title', settings.language[settings.locale].button[attr]);
            }
        });

        fileListNode.stage = query('#fileListFileStage')[0];
        fileListNode.button.node = query('#fileListCanvas')[0];
        fileListNode.textarea.node = query('#textareasDiv')[0];

        if (settings.fileSystem === 'legacy') {
            fileSystem.legacy.node.input = query('#selectFileToOpen')[0];
            fileSystem.legacy.node.download = query('#downloadFile')[0];
        }
        actions.new();
    };
    /**
     * Redefine os valores básicos que servirão de orientação para o
     * uso das setas de posicionamento das tabs
     */
    let redefineMoveTabs = function () {
        let fileListNode = settings.interface.fileList.node;
        let fileListTab = settings.interface.fileList.tabMove;

        if (fileListNode.button.collection.length > 0) {
            let s = fileListNode.stage.offsetWidth;
            let c = 0;
            fileListNode.button.collection.forEach(function (btn) {
                let w = Math.ceil(btn.container.offsetWidth) + 1;
                if (btn.container.style['width'] === '') {
                    btn.container.style['width'] = w + 'px';
                }
                c += w;
            });
            let r = (c - s);
            let p = (
                (fileListNode.button.node.style['marginLeft'] === '')
                    ? 0
                    : parseInt(fileListNode.button.node.style['marginLeft'].replace('px', ''))
            );

            fileListTab.stageW = s;
            fileListTab.canvasW = c;
            fileListTab.range = ((r > 0) ? r : 0);
            fileListTab.position = p;
        }
    };
    /**
     * Seleciona o próximo arquivo na direção indicada.
     *
     * @param   {string} direction
     *          Direção para a qual a ação deve ser executada [prev|next].
     */
    let selectByDirection = function (direction) {
        let fileListNode = settings.interface.fileList.node;
        let fileListTab = settings.interface.fileList.tabMove;

        let nextIndex = fileListTab.selected;

        if (direction === 'next') { nextIndex++; }
        else if (direction === 'prev') { nextIndex--; }

        if (nextIndex >= 0 && nextIndex < fileListNode.button.collection.length) {
            actions.selectFile({ target: fileListNode.button.collection[nextIndex].selectButton });
        }
    };
    /**
     * Ajusta os botões das tabs referentes aos arquivos abertos para que
     * aquela que está selecionada apareça por completo.
     */
    let adjustFileButtonPosition = function () {
        let fileListNode = settings.interface.fileList.node;
        let fileListTab = settings.interface.fileList.tabMove;

        if (fileListTab.range > 0) {
            let wSum = 0;
            let marL = 0;
            fileListNode.button.collection.forEach(function (btn, i) {
                if (i <= fileListTab.selected) {
                    let w = parseInt(btn.container.style['width'].replace('px', ''));
                    wSum += w;

                    if (wSum > fileListTab.stageW) {
                        if (marL === 0) { marL = wSum - fileListTab.stageW; }
                        else { marL += w; }
                    }
                }
            });
            marL = (marL * -1);
            fileListNode.button.node.style['marginLeft'] = marL + 'px';
        }
    };





    /**
     * Ações
     */
    let actions = {
        selectPrev: function () {
            selectByDirection('prev');
        },
        selectNext: function () {
            selectByDirection('next');
        },
        new: function () {
            let fileButtonContainer = document.createElement('span');
            fileButtonContainer.setAttribute('data-file-name', '');
            fileButtonContainer.setAttribute('data-file-index', settings.interface.fileList.files.length);


            let fileButtonSelect = document.createElement('span');
            let useLegend = settings.language[settings.locale].legend['newfile'];
            if (settings.interface.fileList.files.length >= 1) {
                useLegend += ' (' + (settings.interface.fileList.files.length + 1) + ')';
            }
            fileButtonSelect.innerText = useLegend + ' *';
            fileButtonSelect.addEventListener('click', actions['selectFile']);


            let fileButtonClose = document.createElement('button');
            fileButtonClose.innerText = 'X';
            fileButtonClose.setAttribute('type', 'button');
            fileButtonClose.setAttribute('data-btn-action', '');
            fileButtonClose.addEventListener('click', actions['closeFile']);


            let textareaContainer = document.createElement('span');
            let textarea = document.createElement('textarea');
            textarea.setAttribute('spellcheck', settings.spellcheck.toString());


            fileButtonContainer.append(fileButtonSelect);
            fileButtonContainer.append(fileButtonClose);
            textareaContainer.append(textarea);


            let fileListNode = settings.interface.fileList.node;
            fileListNode.button.node.append(fileButtonContainer);
            fileListNode.textarea.node.append(textareaContainer);


            fileListNode.button.collection.push({
                container: fileButtonContainer,
                selectButton: fileButtonSelect,
                closeButton: fileButtonClose
            });
            fileListNode.textarea.collection.push({
                container: textareaContainer,
                textarea: textarea
            });


            settings.interface.fileList.files.push(null);
            actions.selectFile({ target: fileButtonSelect });
        },
        open: function () {
            fileSystem[settings.fileSystem].openFile();
        },
        closeFile: function (e) {
            let fileListNode = settings.interface.fileList.node;

            let index = parseInt(e.target.parentNode.attributes['data-file-index'].value);
            let isActive = (fileListNode.button.collection[index].container.className === 'active');

            fileListNode.button.node.removeChild(fileListNode.button.collection[index].container);

            let parentTextArea = fileListNode.textarea.collection[index].parentNode;
            fileListNode.textarea.node.removeChild(fileListNode.textarea.collection[index].container)



            query('#fileListCanvas > span').forEach(function (btn, i) {
                btn.setAttribute('data-file-index', i);
            });


            fileListNode.button.collection.splice(index, 1);
            fileListNode.textarea.collection.splice(index, 1);
            settings.interface.fileList.files.splice(index, 1);

            if (isActive === true) {
                var tgts = query('#fileListCanvas > span > span');
                if (tgts.length > 0) {
                    actions.selectFile({target: tgts[0]});
                }
            }
        },
        selectFile: function (e) {
            let fileListNode = settings.interface.fileList.node;
            let fileListTab = settings.interface.fileList.tabMove;

            fileListNode.button.collection.forEach(function (btn) {
                btn.container.removeAttribute('class');
            });
            fileListNode.textarea.collection.forEach(function (textarea) {
                textarea.container.setAttribute('hidden', '');
            });

            let index = parseInt(e.target.parentNode.attributes['data-file-index'].value);
            fileListTab.selected = index;

            fileListNode.button.collection[index].container.setAttribute('class', 'active');
            fileListNode.textarea.collection[index].container.removeAttribute('hidden');
            settings.interface.fileList.selected = index;

            redefineMoveTabs();
            adjustFileButtonPosition();
        }
    };





    initi();
};





window.onload = function () {
    insert();
};
