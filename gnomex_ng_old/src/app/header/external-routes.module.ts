import { Component, Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

@Component({
    template: ''
})
export class ExternalLinkComponent {
    constructor() {
    }
}

@Injectable()
export class ExternalLinkResolver implements Resolve<any> {
    resolve(route: ActivatedRouteSnapshot): any {
        window.open(route.data.targetUri, "_blank");
        return true;
    }
}

export class ExternalRoute {
    data: {
        targetUri: string;
    };
    path: string;
    resolve = { link: ExternalLinkResolver };
    component = ExternalLinkComponent;

    constructor(path: string, targetUri: string) {
        this.path = path;
        this.data = { targetUri: targetUri };
    }
}

