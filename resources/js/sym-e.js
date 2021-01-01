'use strict';

/**
 * Implementa recursos que permitem simular um ambiente rodando electron.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
if (typeof (require) === 'undefined') {
    console.log('Initi Electron Simulation');



    /**
     * Simulador da função 'require'.
     *
     * @param {string} module
     */
    var require = function(module) {
        let m = null;

        if (electronModules[module] === undefined) {
            console.log('Cannot load module: ' + module);
        }
        else {
            console.log('Read module: ' + module);
            m = electronModules[module];
        }

        return m;
    };



    /**
     * Objeto contendo os módulos simulados.
     */
    var electronModules = {
        electron: {
            ipcRenderer: {
                send: (channel, args) => {
                    let r = null;
                    console.log('ipcRenderer.send()', channel, args);
                    return r;
                },
                sendSync: (channel, args) => {
                    let r = null;
                    console.log('ipcRenderer.sendSync()', channel, args);

                    switch (channel) {
                        case 'getPathSync':
                            if (args === 'rootPath') {
                                r = window.location.href.split('/');
                                r.pop();
                                r = r.join('/');
                            }
                            else if (args === 'userData') {
                                r = window.location.href.split('/');
                                r.pop();
                                r = r.join('/');
                            }
                            break;

                        case 'cmdOpenSync':
                        case 'cmdOpenFileSync':
                            let c = true;
                            if (channel === 'cmdOpenSync') {
                                c = confirm('Abrir caixa de dialogo e selecionar um arquivo.\nConfirme para carregar\nCancele para desistir.');
                            }

                            if (c === true) {
                                r = {
                                    fullName: 'full/path/to/virtual/file/selectedFile.txt',
                                    shortName: 'selectedFile.txt',
                                    data: '\nInformação fake\npara simular <b>a</b> abertura de um arquivo.\n\n E aqui uma nova linha e tals\n\n\n\n\nTeste!'
                                };
                            }
                            break;

                        case 'cmdSaveSync':
                            r = true;
                            break;

                        case 'cmdSaveAsSync':
                            r = {
                                success: true,
                                fullName: 'full/path/to/virtual/file/selectedFileAs.txt',
                                shortName: 'selectedFileAs.txt',
                            }
                            break;

                        case 'loadJsonFileSync':
                            r = undefined;
                            break;
                    }

                    return r;
                },
                execute: {},
                on: (channel, listener) => {
                    console.log('ipcRenderer.on()', channel, listener);

                    electronModules.electron.ipcRenderer.execute[channel] = listener;
                }
            }
        }
    };

}
