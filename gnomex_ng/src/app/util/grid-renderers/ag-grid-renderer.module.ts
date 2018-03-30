import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CheckboxRenderer } from "./checkbox.renderer";
import { DateRenderer } from "./date.renderer";
import { IconTextRendererComponent, IconRendererComponent } from "./index";
import { IconLinkButtonRenderer } from "./icon-link-button.renderer";
import { SplitStringToMultipleLinesRenderer } from "./split-string-to-multiple-lines.renderer";
import { RemoveLinkButtonRenderer } from "./remove-link-button.renderer";
import { SelectRenderer } from "./select.renderer";
import { TextAlignLeftMiddleRenderer } from "./text-align-left-middle.renderer";
import { TextAlignRightMiddleRenderer } from "./text-align-right-middle.renderer";
import { UploadViewRemoveRenderer } from "./upload-view-remove.renderer";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
			  CheckboxRenderer,
			  DateRenderer,
			  IconLinkButtonRenderer,
        IconTextRendererComponent,
        IconRendererComponent,
			  RemoveLinkButtonRenderer,
			  SelectRenderer,
			  SplitStringToMultipleLinesRenderer,
			  TextAlignLeftMiddleRenderer,
			  TextAlignRightMiddleRenderer,
			  UploadViewRemoveRenderer
    ],
    exports: [
			  CheckboxRenderer,
			  DateRenderer,
			  IconLinkButtonRenderer,
        IconTextRendererComponent,
        IconRendererComponent,
			  RemoveLinkButtonRenderer,
		    SelectRenderer,
		    SplitStringToMultipleLinesRenderer,
		    TextAlignLeftMiddleRenderer,
			  TextAlignRightMiddleRenderer,
			  UploadViewRemoveRenderer
    ]
})
export class AgGridRendererModule { }