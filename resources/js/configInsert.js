'use strict';





/**
 * Controlador das configurações
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
const configInsert = (() => {





    /**
     * Configurações gerais do editor.
     */
    let iniApp = {
        'defaultPath': '',
        'locale': '',
        'commomFiles': {
            'maxFiles': 10,
            'files': []
        },
    };
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
        configEditorLocale.value = appSettings.ini.locale;



        let editorStyle = appSettings.ini.editorStyle;

        configFields.configEditorBackgroundColor.value = editorStyle['background-color'];

        console.log(configFields.configEditorFontFace);
        console.log(editorStyle['font-family']);
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
     * Controla a linguagem em que a aplicação deve ser apresentada.
     *
     * @param {evt} e
     */
    let configEditorLocale = (e) => {

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










    let _public = this.Control = {
        /**
         * Inicia a o formulário de configuração.
         */
        init: () => {
            Object.keys(appSettings.ini).forEach((key) => {
                if (iniApp[key] !== undefined) {
                    iniApp[key] = appSettings.ini[key];
                }
            });

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
        }
    };



    return _public;
})();
