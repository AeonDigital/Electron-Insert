'use strict';







/**
 * Controlador das configurações
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
const insertConfig = (() => {





    /**
     * Configuração de fonte e fundo para o editor
     */
    let editorCss = {
        'background-color': '',
        'font-family': '',
        'font-style': '',
        'font-weight': '',
        'color': '',
        'font-size': '',
        'line-height': ''
    };
    /**
     * Campos que permitem editar as configurações do editor.
     */
    let configFields = {};





    /**
     * Gera a regra CSS para ser aplicada nos nodes dos editores abertos.
     *
     * @return {string}
     */
    let generateCSSRule = () => {
        let cssRule = [];

        for (let it in editorCss) {
            if (editorCss[it] !== '') {
                cssRule.push(it + ': ' + editorCss[it]);
            }
        }

        return cssRule.join('; ');
    };
    /**
     * Aplica nos editores abertos a regra CSS definida.
     */
    let applyCSSRule = () => {
        document.getElementById('mainPanel')
            .setAttribute('style', generateCSSRule());
        appSettings.ini.editorStyle = editorCss;
    };
    /**
     * Aplica nos elementos de formulário de configuração os valores
     * que estão definidos para a aplicação;
     */
    let applyConfigFormValues = () => {
        configFields.configEditorLocale.value = appSettings.ini.locale;



        let editorStyle = appSettings.ini.editorStyle;

        configFields.configEditorBackgroundColor.value = editorStyle['background-color'];

        configFields.configEditorFontFace.value = editorStyle['font-family'];
        configFields.configEditorFontStyle.value = (
            (editorStyle['font-style'] === '') ? editorStyle['font-weight'] : editorStyle['font-style']
        );
        configFields.configEditorFontColor.value = editorStyle['color'];

        configFields.configEditorFontSize.value = editorStyle['font-size'].replace('px', '');
        configFields.configEditorFontSizeKey.value = editorStyle['font-size'].replace('px', '');

        configFields.configEditorLineHeight.value = editorStyle['line-height'].replace('px', '');
        configFields.configEditorLineHeightKey.value = editorStyle['line-height'].replace('px', '');
    };
    /**
     * Aplica as legendas dos botões e controles da aplicação conforme o
     * locale que está configurado.
     *
     * @param {object} locale
     * @param {string} attr
     */
    let applyLocale = (locale, attr) => {
        if (locale === undefined) { locale = appSettings.locale; }
        if (attr === undefined) { attr = 'data-label-locale'; }


        for (let it in locale) {
            if (typeof (locale[it]) === 'object') {
                applyLocale(locale[it], attr + '-' + it);
            }
            else {
                let tgtAttr = '[' + attr + '="' + it + '"]';

                document.querySelectorAll(tgtAttr).forEach((tgt) => {
                    if (tgt.nodeType === Node.ELEMENT_NODE) {
                        let lbl = locale[it];

                        if (lbl !== '') {
                            let lblType = (
                                (tgt.attributes['data-label-type'] === undefined) ?
                                    'innerHTML' :
                                    tgt.attributes['data-label-type'].value
                            );

                            if (lblType === 'innerHTML') {
                                tgt.innerHTML = lbl;
                            }
                            else if (lblType === 'title') {
                                tgt.setAttribute('title', lbl);
                            }

                            if (tgt.attributes['data-btn-shortcut'] !== undefined) {
                                let sc = document.createElement('span');
                                sc.innerHTML = tgt.attributes['data-btn-shortcut'].value;
                                tgt.appendChild(sc);
                            }
                        }
                    }
                });
            }
        }
    };





    /**
     * Controla a linguagem em que a aplicação deve ser apresentada.
     *
     * @param {evt} e
     */
    let configEditorLocale = (e) => {
        let localePath = ipcRenderer.sendSync('getPathSync', 'rootPath') +
                '/resources/locale/' + e.target.value + '.json';
        let locale = ipcRenderer.sendSync('loadJsonFileSync', localePath);

        if (locale === undefined) {
            alert('Lost ' + localePath);
        }
        else {
            appSettings.ini.locale = e.target.value;
            appSettings.locale = locale;
            applyLocale();
        }
    };
    /**
     * Controla a cor de fundo do editor.
     *
     * @param {evt} e
     */
    let configEditorBackgroundColor = (e) => {
        editorCss['background-color'] = e.target.value;
        applyCSSRule();
    };





    /**
     * Controla o tipo de fonte a ser usada.
     *
     * @param {evt} e
     */
    let configEditorFontFace = (e) => {
        editorCss['font-family'] = e.target.value;
        applyCSSRule();
    };
    /**
     * Controla o estilo de fonte a ser usada.
     *
     * @param {evt} e
     */
    let configEditorFontStyle = (e) => {
        if (e.target.value === 'bold') {
            editorCss['font-style'] = '';
            editorCss['font-weight'] = e.target.value;
        }
        else {
            editorCss['font-style'] = e.target.value;
            editorCss['font-weight'] = '';
        }
        applyCSSRule();
    };
    /**
     * Controla a cor de fonte a ser usada.
     *
     * @param {evt} e
     */
    let configEditorFontColor = (e) => {
        editorCss['color'] = e.target.value;
        applyCSSRule();
    };
    /**
     * Controla o tamanho da fonte a ser usada.
     *
     * @param {evt} e
     */
    let configEditorFontSize = (e) => {
        let allowed = true;

        if (e.target.id === 'configEditorFontSize') {
            configFields.configEditorFontSizeKey.value = e.target.value;
        }
        else if (e.target.id === 'configEditorFontSizeKey') {
            configFields.configEditorFontSize.value = e.target.value;
        }

        if (allowed === true) {
            editorCss['font-size'] = e.target.value + 'px';
            applyCSSRule();
        }
    };
    /**
     * Controla o tamanho da fonte a ser usada.
     *
     * @param {evt} e
     */
    let configEditorLineHeight = (e) => {
        if (e.target.id === 'configEditorLineHeight') {
            document.getElementById('configEditorLineHeightKey').value = e.target.value;
        }
        else if (e.target.id === 'configEditorLineHeightKey') {
            document.getElementById('configEditorLineHeight').value = e.target.value;
        }

        editorCss['line-height'] = e.target.value + 'px';
        applyCSSRule();
    };
    /**
     * Monitora um campo e permite inserir no mesmo apenas caracteres numéricos.
     *
     * @param {evt} e
     */
    let onKeyDownCheck_allowOnlyNumber = (e) => {
        let allowed = [
            '1', '2', '3', '4', '5',
            '6', '7', '8', '9', '0',
            'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft',
            'Backspace', 'Tab', 'Delete', 'Home', 'End'
        ];
        if (allowed.indexOf(e.key) === -1) {
            e.preventDefault();
            return false;
        }
    };





    /**
     * Coleção de botões do tipo "tab"
     */
    let tabButtons = null;
    /**
     * Coleção de nodes do tipo "panel"
     */
    let tabPanels = null;
    /**
     * Mostra o painel selecionado e esconde os demais.
     *
     * @param {evt} e
     */
    let evtShowHidePanels = (e) => {
        if (e === undefined) {
            e = { 'target': tabButtons[0] };
        }
        let tgtPanel = e.target.attributes['data-tab-target-panel'].value;

        for (var it in tabButtons) {
            if (tabButtons[it].attributes['data-tab-target-panel'].value === tgtPanel) {
                tabButtons[it].classList.add('active');
                tabPanels[it].classList.add('active');
            }
            else {
                tabButtons[it].classList.remove('active');
                tabPanels[it].classList.remove('active');
            }
        }
    };










    let _public = this.Control = {
        /**
         * Inicia a o formulário de configuração.
         */
        init: () => {
            applyLocale();


            Object.keys(appSettings.ini.editorStyle).forEach((key) => {
                if (editorCss[key] !== undefined) {
                    editorCss[key] = appSettings.ini.editorStyle[key];
                }
            });
            applyCSSRule();


            configFields = {
                'configEditorLocale': document.getElementById('configEditorLocale'),

                'configEditorBackgroundColor': document.getElementById('configEditorBackgroundColor'),

                'configEditorFontFace': document.getElementById('configEditorFontFace'),
                'configEditorFontStyle': document.getElementById('configEditorFontStyle'),
                'configEditorFontColor': document.getElementById('configEditorFontColor'),

                'configEditorFontSize': document.getElementById('configEditorFontSize'),
                'configEditorFontSizeKey': document.getElementById('configEditorFontSizeKey'),

                'configEditorLineHeight': document.getElementById('configEditorLineHeight'),
                'configEditorLineHeightKey': document.getElementById('configEditorLineHeightKey'),
            };
            applyConfigFormValues();


            configFields.configEditorLocale
                .addEventListener('change', configEditorLocale);


            configFields.configEditorBackgroundColor
                .addEventListener('change', configEditorBackgroundColor);

            configFields.configEditorFontFace
                .addEventListener('change', configEditorFontFace);
            configFields.configEditorFontStyle
                .addEventListener('change', configEditorFontStyle);
            configFields.configEditorFontColor
                .addEventListener('change', configEditorFontColor);

            configFields.configEditorFontSize
                .addEventListener('change', configEditorFontSize);
            configFields.configEditorFontSizeKey
                .addEventListener('change', configEditorFontSize);
            configFields.configEditorFontSizeKey
                .addEventListener('keydown', onKeyDownCheck_allowOnlyNumber);


            configFields.configEditorLineHeight
                .addEventListener('change', configEditorLineHeight);
            configFields.configEditorLineHeightKey
                .addEventListener('change', configEditorLineHeight);
            configFields.configEditorLineHeightKey
                .addEventListener('keydown', onKeyDownCheck_allowOnlyNumber);




            tabButtons = [];
            tabPanels = [];

            document.querySelectorAll('[data-tab-button]').forEach((btn) => {
                if (btn.nodeType === Node.ELEMENT_NODE) {
                    tabButtons.push(btn);
                    btn.addEventListener('click', evtShowHidePanels);
                }
            });
            document.querySelectorAll('[data-tab-panel]').forEach((tab) => {
                if (tab.nodeType === Node.ELEMENT_NODE) {
                    tabPanels.push(tab);
                }
            });
            evtShowHidePanels();


            document.getElementById('cmdSaveConfigurations')
                .addEventListener('click', _public.cmdSaveConfigurations);
        },
        /**
         * Salva as configurações atuais do editor no arquivo de perferencias
         * pessoais do usuário.
         */
        cmdSaveConfigurations: (e) => {
            let saveResult = ipcRenderer.sendSync(
                'cmdSaveSync',
                {
                    fullName: ipcRenderer.sendSync('getPathSync', 'userData') + '/user.json',
                    data: JSON.stringify(appSettings.ini, null, 4)
                }
            );

            if (saveResult === false) {
                alert(appSettings.locale.CMD.cmdSaveConfigurations.onFail);
            }
            else {
                if (e !== undefined) {
                    alert(appSettings.locale.CMD.cmdSaveConfigurations.onSuccess);
                }
            }
        }
    };



    return _public;
})();
