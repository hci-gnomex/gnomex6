import {Component, ElementRef, ViewChild} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular";
import {BillingPOFormService} from "../../services/billingPOForm.service";
import {DialogsService} from "../popup/dialogs.service";

@Component({
    template: `
        <div class="full-width full-height">
            <div class="t full-width full-height cursor">
                <div class="tr">
                    <div class="td vertical-center button-container">
                        <input type="file" class="hidden" (change)="selectFile($event)" #fileInput>
                        <button class="link-button" (click)="onClickUpload()">
                            <img src="../../../assets/upload.png" alt=""/>
                            <div class="name inline-block">
                                Upload
                            </div>
                        </button>
                        <button *ngIf="hasPoForm" class="link-button"
                                (click)="onClickView()">
                            <img src="../../../assets/page_find.gif" alt=""/>
                            <div class="name inline-block">
                                View
                            </div>
                        </button>
                        <button *ngIf="hasPoForm" class="link-button"
                                (click)="onClickRemove()">
                            <img src="../../../assets/page_cross.gif" alt=""/>
                            <div class="name inline-block">
                                Remove
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        button.link-button {
            background: none;
            background-color: inherit;
            color: #0000FF;
            border: none;
            padding: 0;
            cursor: pointer;
            margin-right: 0.6rem;
        }
        button.link-button:focus {
            outline: none;
        }

        .button-container {
            padding-left: 0.3rem;
        }

        .cursor { cursor: pointer; }

        .full-width  { width:  100%; }
        .full-height { height: 100%; }

        .t  { display: table; }
        .tr { display: table-row; }
        .td { display: table-cell; }

        .inline-block { display: inline-block; }
        
        .hidden { display: none; }

        .vertical-center { vertical-align: middle; }

        .name {
            padding-left: 0.2rem;
            text-decoration: underline;
        }
    `]
})
export class UploadViewRemoveRenderer implements ICellRendererAngularComp {
    public params: any;
    public hasPoForm: boolean;
    public file: any;

    @ViewChild('fileInput') fileInput: ElementRef;

    constructor(private poFormService: BillingPOFormService,
                private dialogService: DialogsService) {}

    agInit(params: any): void {
        this.params = params;
        this.hasPoForm = false;

        this.checkIfHasPoForm();
    }

    refresh(params: any): boolean {
        return false;
    }

    checkIfHasPoForm(): void {
        if (this.params && this.params.data
            && this.params.data.purchaseOrderForm && this.params.data.purchaseOrderForm !== ''
            && this.params.data.orderFormFileType && this.params.data.orderFormFileType !== ''
            && this.params.data.orderFormFileSize && this.params.data.orderFormFileSize !== '') {
            this.hasPoForm = true;
        } else {
            this.hasPoForm = false;
        }
    }

    public onClickUpload(): void {
        if (this.hasPoForm) {
            let message: string = "By uploading a new purchase form you will overwrite the existing purchase form.\n\n" +
                "Continue anyway?";
            this.dialogService.yesNoDialog(message, this, 'triggerFileSelector');
        } else {
            this.triggerFileSelector();
        }
    }

    private triggerFileSelector() {
        this.fileInput.nativeElement.value = null;
        this.fileInput.nativeElement.click();
    }

    selectFile(event: any) {
        if(event.target.files && event.target.files.length > 0) {
            this.file = event.target.files[0];
            console.log("Selected a file! " + this.file.name);

            let formData: FormData = new FormData();
            formData.append("Filename", this.file.name);
            formData.append("format", this.file.type == "text/html" ? "html" : "text");
            formData.append("idBillingAccount", this.params.data.idBillingAccount);
            formData.append("Filedata", this.file, this.file.name);

            this.poFormService.uploadNewForm(formData).subscribe((uploadWasSuccessful) => {
                if (uploadWasSuccessful) {
                    this.dialogService.alert("File uploaded successfully");
                } else {
                    this.dialogService.alert("File failed to upload.");
                }

                this.hasPoForm = this.hasPoForm || uploadWasSuccessful;
            });
        }
    }

    public onClickView():void {
        let billingAccount:number = this.params.data.idBillingAccount;
        let url:string = 'GetPurchaseOrderForm.gx?idBillingAccount=' + billingAccount;
        window.open(url, '_blank');
    }

    public onClickRemove():void {
        // if (dirty.isDirty()) {
        //     Alert.show("Please save existing changes before attempting to upload/remove a purchase order form.");
        //     return;
        // }
        if (this.poFormService && this.params && this.params.data) {
            this.poFormService.deletePoFormFromBillingAccount(this.params.data.idBillingAccount).subscribe((deleteWasSuccessful) => {
                this.hasPoForm = !deleteWasSuccessful;

                if (deleteWasSuccessful) {
                    this.dialogService.alert("File successfully removed");
                }
            });
        }
    }
}