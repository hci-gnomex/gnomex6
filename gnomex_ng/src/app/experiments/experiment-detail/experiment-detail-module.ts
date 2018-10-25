import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'


import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {AgGridModule} from "ag-grid-angular";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {UtilModule} from "../../util/util.module";
import {TreeModule} from "angular-tree-component";
import {RelatedDataModule} from "../../util/related-data.module";
import {
    ExperimentDetailOverviewComponent,
    DescriptionTab
} from './index'


import {
    RichEditorModule,
} from '../../../modules/index';
import {ExperimentOverviewTabComponent} from "./experiment-overview-tab.component";
import {CollaboratorsDialogComponent} from "./collaborators-dialog.component";
import {ExperimentBioinformaticsTabComponent} from "./experiment-bioinformatics-tab.component";



@NgModule({
    imports: [
        CommonModule,
        AgGridModule.withComponents([IconTextRendererComponent]),
        AngularMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        UtilModule,
        RelatedDataModule,
        RichEditorModule
    ],

    declarations: [
        CollaboratorsDialogComponent,
        ExperimentBioinformaticsTabComponent,
        ExperimentOverviewTabComponent,
        ExperimentDetailOverviewComponent,
        DescriptionTab
    ],
    providers: [],
    entryComponents: [
        CollaboratorsDialogComponent
    ],
    exports: []
})
export class ExperimentDetailModule { }