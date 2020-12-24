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

                    switch (channel) {
                        case 'dialogOpenFile':
                            let c = confirm('Abrir caixa de dialogo e selecionar um arquivo.\nConfirme para carregar\nCancele para desistir.');
                            if (c === true) {
                                appInsert.cmdOpen({
                                    fullName: 'full/path/to/virtual/file/selectedFile.txt',
                                    shortName: 'selectedFile.txt',
                                    data: 'Informação fake\npara simular <b>a</b> abertura de um arquivo.\n\nE aqui uma nova linha e tals'
                                });
                            }
                            break;

                        case 'save':
                            args.save();
                            break;

                        case 'saveAs':
                            args.saveAs('c:\\novo\local\\novoNome.txt', 'novoNome.txt');
                            break;
                    }
                    return r;
                },
                sendSync: (channel, args) => {
                    let r = null;
                    console.log('ipcRenderer.sendSync()', channel, args);

                    switch (channel) {
                        case 'getRootPath':
                            let r = window.location.href.split('/');
                            r.pop();
                            r = r.join('/');
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
