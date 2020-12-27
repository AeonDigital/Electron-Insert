'use strict';





/**
 * Monitora o cursor selection de uma área editável do DOM mantendo registro
 * de seu estado e permitindo redefini-la caso necessário.
 *
 * @author      Rianna Cantarelli <rianna@aeondigital.com.br>
 * @copyright   2020, Rianna Cantarelli
 * @license     MIT
 */
let insertCursor = function (node, evtOnPaste) {



    /**
     * Node que está sendo monitorado
     *
     * @type {node}
     */
    let editNode = null;

    /**
     * Node onde a seleção deve iniciar.
     *
     * Pela natureza do objeto 'Range' este deve SEMPRE preceder a posição no DOM
     * do node 'selectionEndNode';
     *
     * @type {node}
     */
    let selectionStartNode = null;
    /**
     * Posição na qual o cursor deve iniciar a seleção.
     *
     * @type {int}
     */
    let selectionStartNodeOffset = null;
    /**
     * Node onde a seleção deve encerrar.
     *
     * Pela natureza do objeto 'Range' este deve SEMPRE suceder a posição no DOM
     * do node 'selectionStartNode';
     *
     * @type {node}
     */
    let selectionEndNode = null;
    /**
     * Posição na qual o cursor deve finalizar a seleção.
     *
     * @type {int}
     */
    let selectionEndNodeOffset = null;

    /**
     * Indica internamente quando a instância está apta a seguir atualizando as
     * propriedades de localização do range.
     *
     * @type {bool}
     */
    let selectionLocked = false;





    /**
     * Inicia uma nova representação de um arquivo para o editor.
     */
    let constructor = (node, evtOnPaste) => {
        editNode = node;
    };
















    let p = this.Control = {

    };




    // Inicia o objeto
    constructor(node);
    return p;
};
