'use strict';





/**
 * Permite um controle mais conciso dos eventos "onResize".
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let onResizeEnd = (() => {





    /**
     * Coleção de eventos que devem ser disparados ao fim do resize.
     *
     * @type {array}
     */
    let collectionOnResizeEnd = [];
    /**
     * Evento que será disparado ao finalizar o resize.
     *
     * @type {evt}
     */
    let timeoutOnResizeEnd = null;





    /**
     * Evento OnResize
     *
     * @param {event} e
     */
    let evtOnResizeEnd = (e) => {
        if (timeoutOnResizeEnd !== null) {
            clearTimeout(timeoutOnResizeEnd);
            timeoutOnResizeEnd = null;
        }

        timeoutOnResizeEnd = setTimeout(() => {
            if (collectionOnResizeEnd.length > 0) {
                for (let it in collectionOnResizeEnd) {
                    collectionOnResizeEnd[it](e);
                }
            }
        }, 300);
    };
    /**
     * Retorna o índice da função indicada.
     *
     * @param {function|name} fn
     *
     * @return {int}
     */
    let retrieveFunctionIndex = (fn) => {
        let r = null;

        for (let it in collectionOnResizeEnd) {
            if (collectionOnResizeEnd[it] === fn || collectionOnResizeEnd[it].name === fn) {
                r = parseInt(it);
            }
        }

        return r;
    };





    let p = this.Control = {
        /**
         * Adiciona um evento ao final da lista de eventos do onresize.
         *
         * @param {function} fn
         *
         * @return {bool}
         */
        addEventListener: (fn) => {
            let r = false;

            if ({}.toString.call(fn) === '[object Function]') {
                collectionOnResizeEnd.push(fn);
                r = true;
            }

            return r;
        },
        /**
         * Desvincula o evento alvo da lista de ações.
         *
         * @param {function|name} fn
         *
         * @returns {bool}
         */
        removeEventListener: (fn) => {
            let r = false;

            let tgtIndex = retrieveFunctionIndex(fn);
            if (tgtIndex !== null) {
                collectionOnResizeEnd.splice(tgtIndex, 1);
                r = true;
            }

            return r;
        },
        /**
         * Remove todos os eventos da lista.
         */
        clearEventListener: () => {
            collectionOnResizeEnd = [];
        }
    };



    window.onresize = evtOnResizeEnd;
    return p;
})();
