/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {enableProdMode} from '@angular/core';

import {GnomexAppModule} from "./app/gnomex-app.module";
import {BootController} from "./boot-control";

/**
 * The entry point for the CORE client application.
 *
 * @author brandony <brandon.youkstetter@hci.utah.edu>
 * @author jasonholmberg <jason.holmberg@hci.utah.edu>
 * @since 8/24/16
 */
//if (process.env.ENV === "production") {
    enableProdMode();
//}

//platformBrowserDynamic().bootstrapModule(GnomexAppModule);

const init = () => {
    platformBrowserDynamic().bootstrapModule(GnomexAppModule)
        .then(() => (<any>window).appBootstrap && (<any>window).appBootstrap())
        .catch(err => console.error('NG Bootstrap Error =>', err));
}

// Init on first load
init();

// Init on reboot request
const boot = BootController.getbootControl().watchReboot().subscribe(() => init());
