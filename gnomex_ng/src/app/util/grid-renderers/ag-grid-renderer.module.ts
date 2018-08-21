import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApproveButtonRenderer } from "./approve-button.renderer";
import { CheckboxRenderer } from "./checkbox.renderer";
import { DateRenderer } from "./date.renderer";
import { IconTextRendererComponent, IconRendererComponent } from "./index";
import { IconLinkButtonRenderer } from "./icon-link-button.renderer";
import { SplitStringToMultipleLinesRenderer } from "./split-string-to-multiple-lines.renderer";
import { RemoveLinkButtonRenderer } from "./remove-link-button.renderer";
import { SelectRenderer } from "./select.renderer";
import { TextAlignLeftMiddleRenderer } from "./text-align-left-middle.renderer";
import { TextAlignRightMiddleRenderer } from "./text-align-right-middle.renderer";
import { TextSelectXorMultiselectRenderer } from "./text-select-xor-multiselect.renderer";
import { UploadViewRemoveRenderer } from "./upload-view-remove.renderer";
import {TwoButtonRenderer} from "./two-button.renderer";
import {MultipleLineTextRenderer} from "./multiple-line-text.renderer";
import {MultiSelectRenderer} from "./multi-select.renderer";
import {UrlAnnotRenderer} from "./url-annot-renderer";

@NgModule({
    imports: [
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