import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CheckboxRenderer } from "./checkbox.renderer";
import { IconTextRendererComponent, IconRendererComponent } from "./index";
import { IconLinkButtonRenderer } from "./icon-link-button.renderer";
import { MultipleUsersRenderer } from "./multiple-users.renderer";
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
			  IconLinkButtonRenderer,
        IconTextRendererComponent,
        IconRendererComponent,
			  MultipleUsersRenderer,
			  RemoveLinkButtonRenderer,
			  SelectRenderer,
			  TextAlignLeftMiddleRenderer,
			  TextAlignRightMiddleRenderer,
			  UploadViewRemoveRenderer
    ],
    exports: [
			  CheckboxRenderer,
			  IconLinkButtonRenderer,
        IconTextRendererComponent,
        IconRendererComponent,
			  MultipleUsersRenderer,
			  RemoveLinkButtonRenderer,
			  SelectRenderer,
			  TextAlignLeftMiddleRenderer,
			  TextAlignRightMiddleRenderer,
			  UploadViewRemoveRenderer
    ]
})
export class AgGridRendererModule { }