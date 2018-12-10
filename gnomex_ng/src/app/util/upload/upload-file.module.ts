import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule, MatListModule, MatProgressBarModule } from '@angular/material';
import { UploadFileComponent } from './upload-file.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UploadFileService } from './upload-file.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [CommonModule, MatButtonModule, MatDialogModule, MatListModule, HttpClientModule, BrowserAnimationsModule, MatProgressBarModule],
    declarations: [ UploadFileComponent],
    exports: [UploadFileComponent],
    providers: [UploadFileService]
})
export class UploadFileModule {}