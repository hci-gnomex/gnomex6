import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ProgressBarModule } from "../../../modules/progressbar.module";

import { DatatracksPanelComponent,
        DatatracksOrganismComponent,
        DatatracksGenomeBuildComponent,
        GBDetailTabComponent,
        GBSegmentsTabComponent,
        ImportSegmentsDialog,
        GBSequenceFilesTabComponent,
        SequenceFilesDialog
        } from './index'
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {AgGridModule} from "ag-grid-angular";
import {TabsModule} from "../../util/tabs/tabs.module";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {DATATRACKS_ROUTING} from "../datatracks.routes";





@NgModule({
    imports: [
        CommonModule,
        AgGridModule.withComponents([IconTextRendererComponent]),
        TabsModule,
        DATATRACKS_ROUTING,
        AngularMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        ProgressBarModule
    ],

    declarations: [
        DatatracksPanelComponent,
        DatatracksOrganismComponent,
        DatatracksGenomeBuildComponent,
        GBDetailTabComponent,
        GBSegmentsTabComponent,
        GBSequenceFilesTabComponent,
        ImportSegmentsDialog,
        SequenceFilesDialog
    ],
    providers: [],
    entryComponents: [
        GBDetailTabComponent,
        GBSegmentsTabComponent,
        ImportSegmentsDialog,
        SequenceFilesDialog,
        GBSequenceFilesTabComponent],
    exports: [DatatracksPanelComponent]
})
export class DatatracksOverviewModule { }