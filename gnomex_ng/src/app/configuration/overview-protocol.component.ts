import {Component} from '@angular/core';

@Component({
    selector: 'overview-protocol',
    template: `        
        <edit-protocol></edit-protocol>
    `
})
export class OverviewProtocolComponent {
    // This component exists mostly for consistency with other similar routing situations, but also
    // so that if we ever wanted a different overview screen, we would have a starting point without
    // needing to change the routing behavior of the module.
}