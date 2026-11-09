import { Component, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';

@Component({
    template: ''
})
export class ExternalLinkComponent {
    constructor() {
    }
}

/**
 * Opens an external link (a header quick link or the User Guide) in a new tab and cancels the
 * navigation, so the user stays on the page they were on. (As a resolver it opened the link but
 * still routed this tab to ExternalLinkComponent, an empty page.)
 */
@Injectable()
export class ExternalLinkGuard implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot): boolean {
        window.open(route.data.targetUri, "_blank");
        return false;
    }
}

export class ExternalRoute {
    data: {
        targetUri: string;
    };
    path: string;
    canActivate = [ExternalLinkGuard];
    component = ExternalLinkComponent;

    constructor(path: string, targetUri: string) {
        this.path = path;
        this.data = { targetUri: targetUri };
    }
}
