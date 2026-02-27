import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule, MatInputModule,
    MatListModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule
} from '@angular/material';
import { UploadFileComponent } from './upload-file.component';
import { AgGridModule } from "ag-grid-angular";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {ManageFilesDialogComponent} from "./manage-files-dialog.component";
import {OrganizeFilesComponent} from "./organize-files.component";
import {NameFileDialogComponent} from "./name-file-dialog.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TreeModule} from "@circlon/angular-tree-component";
import {AngularSplitModule} from "angular-split";
import {UtilModule} from "../util.module";
import {LinkedSampleFileComponent} from "./linked-sample-file.component";
import {AccessibilityModule} from "../accessibility/accessibility.module";

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatListModule,
    MatTabsModule,
    MatInputModule,
    HttpClientModule,
    MatTooltipModule,
    TreeModule,
    AgGridModule,
    AngularSplitModule,
    MatFormFieldModule,
    UtilModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule,
    AccessibilityModule

  ],
    declarations: [ UploadFileComponent,
        ManageFilesDialogComponent,
        OrganizeFilesComponent,
        NameFileDialogComponent,
        LinkedSampleFileComponent
    ],
    exports: [ManageFilesDialogComponent],
    entryComponents: [ NameFileDialogComponent]
})
export class ManageFilesModule {}
