import { Routes, RouterModule } from "@angular/router";
import {BulkSampleUploadLauncherComponent} from "./bulk-sample-upload.component";


const ROUTES: Routes = [
    { path: "BulkSampleUpload", component: BulkSampleUploadLauncherComponent, outlet: 'modal' },
];

export const UPLOAD_ROUTING = RouterModule.forChild(ROUTES);
