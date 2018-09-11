import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AgGridModule} from "ag-grid-angular";

import {AgGridRendererModule} from "../util/grid-renderers/ag-grid-renderer.module";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {AngularSplitModule} from "angular-split";
import {ServicesModule} from "../services/services.module";
import {UtilModule} from "../util/util.module";
import {WindowModule} from "../../modules/window.module";

import {UPLOAD_ROUTING} from "./upload.routes";

import {
    BulkSampleUploadComponent,
    BulkSampleUploadLauncherComponent
} from "./bulk-sample-upload.component";

import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";
import {IconRendererComponent} from "../util/grid-renderers/icon-renderer.component";
import {MultipleLineTextRenderer} from "../util/grid-renderers/multiple-line-text.renderer";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {ShowErrorsShowSamplesRenderer} from "../util/grid-renderers/show-errors-show-samples.renderer";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignRightMiddleRenderer} from "../util/grid-renderers/text-align-right-middle.renderer";
import {TwoButtonRenderer} from "../util/grid-renderers/two-button.renderer";
import {MultiSelectRenderer} from "../util/grid-renderers/multi-select.renderer";
import {UrlAnnotRenderer} from "../util/grid-renderers/url-annot-renderer";
import {CheckboxRenderer} from "../util/grid-renderers/checkbox.renderer";

import {SampleUploadService} from "./sample-upload.service";

@NgModule({
    imports: [
        UPLOAD_ROUTING,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ServicesModule,
        UtilModule,
        WindowModule,
        AngularMaterialModule,
        AgGridRendererModule,
        AgGridModule.withComponents([
            DateRenderer,
            IconTextRendererComponent,
            IconRendererComponent,
            MultipleLineTextRenderer,
            SelectRenderer,
            ShowErrorsShowSamplesRenderer,
            TextAlignLeftMiddleRenderer,
            TextAlignRightMiddleRenderer,
            TwoButtonRenderer,
            MultiSelectRenderer,
            UrlAnnotRenderer,
            CheckboxRenderer,
        ]),
        AngularSplitModule,
    ],
    declarations: [
        BulkSampleUploadComponent,
        BulkSampleUploadLauncherComponent
    ],
    exports: [
        BulkSampleUploadComponent,
        BulkSampleUploadLauncherComponent
    ],
    entryComponents: [
        BulkSampleUploadComponent
    ],
    providers: [
        SampleUploadService
    ]
})
export class UploadModule { }