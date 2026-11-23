/**
 * Bandera de idioma del despliegue.
 *
 * Un despliegue compila para un solo mercado, así que el idioma es una constante:
 * no hay selector ni estado que pueda desincronizarse entre servidor y navegador.
 */
import {IS_US} from './market';

export const EN = IS_US;

export default EN;
