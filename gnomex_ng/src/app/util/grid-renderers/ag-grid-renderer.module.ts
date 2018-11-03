import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularMaterialModule } from "../../../modules/angular-material.module";

import { ApproveButtonRenderer } from "./approve-button.renderer";
import { CheckboxRenderer } from "./checkbox.renderer";
import { DateRenderer } from "./date.renderer";
import { IconTextRendererComponent, IconRendererComponent } from "./index";
import { IconLinkButtonRenderer } from "./icon-link-button.renderer";
import { MultipleLineTextRenderer } from "./multiple-line-text.renderer";
import { RemoveLinkButtonRenderer } from "./remove-link-button.renderer";
import { SelectRenderer } from "./select.renderer";
import { SeqLibSelectRenderer } from "./seqlib-select.renderer";
import { ShowErrorsShowSamplesRenderer } from "./show-errors-show-samples.renderer";
import { SplitStringToMultipleLinesRenderer } from "./split-string-to-multiple-lines.renderer";
import { TextAlignLeftMiddleRenderer } from "./text-align-left-middle.renderer";
import { TextAlignRightMiddleRenderer } from "./text-align-right-middle.renderer";
import { TextSelectXorMultiselectRenderer } from "./text-select-xor-multiselect.renderer";
import { TwoButtonRenderer } from "./two-button.renderer";
import { UploadViewRemoveRenderer } from "./upload-view-remove.renderer";
import {MultiSelectRenderer} from "./multi-select.renderer";
import {UrlAnnotRenderer} from "./url-annot-renderer";

@NgModule({
    imports: [
        AngularMaterialModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
		ApproveButtonRenderer,
		CheckboxRenderer,
		DateRenderer,
		IconLinkButtonRenderer,
        IconTextRendererComponent,
        IconRendererComponent,
        MultipleLineTextRenderer,
		RemoveLinkButtonRenderer,
		SelectRenderer,
        SeqLibSelectRenderer,
        ShowErrorsShowSamplesRenderer,
		SplitStringToMultipleLinesRenderer,
		TextAlignLeftMiddleRenderer,
		TextAlignRightMiddleRenderer,
        TextSelectXorMultiselectRenderer,
		TwoButtonRenderer,
		UploadViewRemoveRenderer,
		MultiSelectRenderer,
		UrlAnnotRenderer
    ],
    exports: [
		ApproveButtonRenderer,
		CheckboxRenderer,
		DateRenderer,
		IconLinkButtonRenderer,
        IconTextRendererComponent,
        IconRendererComponent,
        MultipleLineTextRenderer,
		RemoveLinkButtonRenderer,
		SelectRenderer,
        SeqLibSelectRenderer,
        ShowErrorsShowSamplesRenderer,
		SplitStringToMultipleLinesRenderer,
		TextAlignLeftMiddleRenderer,
		TextAlignRightMiddleRenderer,
        TextSelectXorMultiselectRenderer,
        TwoButtonRenderer,
		UploadViewRemoveRenderer,
        MultiSelectRenderer,
        UrlAnnotRenderer
    ]
})
export class AgGridRendererModule { }