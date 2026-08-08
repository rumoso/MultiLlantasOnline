import { Directive, HostBinding } from '@angular/core';

/**
 * Desactiva el autocompletado del navegador en TODO input/textarea del sistema.
 * Se aplica automaticamente (se exporta desde SharedModule) a los inputs que no
 * declaran su propio `autocomplete`, para no pisar los que ya lo definen.
 */
@Directive({
    selector: 'input:not([autocomplete]), textarea:not([autocomplete])',
    standalone: true
})
export class NoAutocompleteDirective {
    @HostBinding('attr.autocomplete') autocomplete = 'off';

    // Ayuda a suprimir tambien las sugerencias/autofill en moviles.
    @HostBinding('attr.autocorrect') autocorrect = 'off';
    @HostBinding('attr.autocapitalize') autocapitalize = 'off';
    @HostBinding('attr.spellcheck') spellcheck = 'false';
}
