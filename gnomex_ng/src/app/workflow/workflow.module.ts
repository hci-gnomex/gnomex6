/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule,ReactiveFormsModule} from "@angular/forms";

import {ServicesModule} from "../services/services.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DialogsModule} from "../util/popup/dialogs.module";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {UtilModule} from "../util/util.module";
import {WORKFLOW_ROUTING} from "./workflow.routes";
import {QcWorkflowComponent} from "./qc-workflow.component";
import { AgGridModule } from 'ag-grid-angular/main';
import { AgGridEditorModule } from "../util/grid-editors/ag-grid-editor.module";
import { AgGridRendererModule } from "../util/grid-renderers/ag-grid-renderer.module";
import { CheckboxRenderer } from "../util/grid-renderers/checkbox.renderer";
import { DateEditor } from "../util/grid-editors/date.editor";
import { DateRenderer } from "../util/grid-renderers/date.renderer";
import { IconLinkButtonRenderer } from "../util/grid-renderers/icon-link-button.renderer";
import { SplitStringToMultipleLinesRenderer } from "../util/grid-renderers/split-string-to-multiple-lines.renderer";
import { RemoveLinkButtonRenderer } from "../util/grid-renderers/remove-link-button.renderer";
import { SelectEditor } from "../util/grid-editors/select.editor";
import { SelectRenderer } from "../util/grid-renderers/select.renderer";
import { TextAlignLeftMiddleRenderer } from "../util/grid-renderers/text-align-left-middle.renderer";
import { TextAlignRightMiddleRenderer } from "../util/grid-renderers/text-align-right-middle.renderer";
import { UploadViewRemoveRenderer } from "../util/grid-renderers/upload-view-remove.renderer";
import {WorkflowComponent} from "./workflow.component";
import {LibprepWorkflowComponent} from "./libprep-workflow.component";
import {BarcodeSelectEditor} from "../util/grid-editors/barcode-select.editor";
import {LibprepQcWorkflowComponent} from "./libprepqc-workflow.component";
import {FlowcellassmWorkflowComponent} from "./flowcellassm-workflow.component";
import {AngularSplitModule} from "angular-split";
import {SeqlaneSelectEditor} from "../util/grid-editors/seqlane-select.editor";
import {DeleteSeqlaneDialogComponent} from "./delete-seqlane-dialog.component";
import {FinalizeWorkflowComponent} from "./finalize-workflow.component";
import {FillLikeEditor} from "../util/grid-editors/filllike-select.editor";
import { DynamicModule } from 'ng-dynamic-component';
import {PipelineWorkflowComponent} from "./pipeline-workflow.component";
import {FlowcellWorkflowComponent} from "./flowcell-workflow.component";
import {EditFlowcellDialogComponent} from "./edit-flowcell-dialog.component";
import { TreeModule } from "angular-tree-component";

/**
 * @author jdewell
 * @since 12/19/16
 */


@NgModule({
    imports: [
        AgGridEditorModule,
        AgGridModule.withComponents([
            CheckboxRenderer,
            DateEditor,
            DateRenderer,
            IconLinkButtonRenderer,
            RemoveLinkButtonRenderer,
            SelectEditor,
            BarcodeSelectEditor,
            FillLikeEditor,
            SeqlaneSelectEditor,
            SelectRenderer,
            SplitStringToMultipleLinesRenderer,
            TextAlignLeftMiddleRenderer,
            TextAlignRightMiddleRenderer,
            UploadViewRemoveRenderer,
        ]),
        AgGridRendererModule,
        AngularMaterialModule,
        AngularSplitModule,
        DialogsModule,
        BrowserAnimationsModule,
        WORKFLOW_ROUTING,
        CommonModule,
        FormsModule,
        ServicesModule,
        UtilModule,
        ReactiveFormsModule,
        TreeModule,
        DynamicModule.withComponents([QcWorkflowComponent, LibprepWorkflowComponent, LibprepQcWorkflowComponent,
            FlowcellassmWorkflowComponent,  FinalizeWorkflowComponent])
    ],
    declarations: [WorkflowComponent, QcWorkflowComponent, LibprepWorkflowComponent, LibprepQcWorkflowComponent,
                    FlowcellassmWorkflowComponent, DeleteSeqlaneDialogComponent, FinalizeWorkflowComponent, PipelineWorkflowComponent,
                    FlowcellWorkflowComponent, EditFlowcellDialogComponent],
    entryComponents: [WorkflowComponent, QcWorkflowComponent, LibprepWorkflowComponent, LibprepQcWorkflowComponent,
                    FlowcellassmWorkflowComponent, DeleteSeqlaneDialogComponent, FinalizeWorkflowComponent, PipelineWorkflowComponent,
                    FlowcellWorkflowComponent, EditFlowcellDialogComponent],
    exports: [WorkflowComponent, QcWorkflowComponent, LibprepWorkflowComponent, LibprepQcWorkflowComponent,
                    FlowcellassmWorkflowComponent, DeleteSeqlaneDialogComponent, FinalizeWorkflowComponent, PipelineWorkflowComponent,
                    FlowcellWorkflowComponent, EditFlowcellDialogComponent]
})
export class WorkflowModule {
}
