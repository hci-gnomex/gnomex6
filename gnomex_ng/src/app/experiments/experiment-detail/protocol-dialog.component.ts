import {AfterViewInit, Component, Inject, isDevMode, OnInit} from "@angular/core";

import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
    selector: "protocol-dialog",
    template: `
        <div class="full-height full-width flex-container-col">
            <div mat-dialog-title class="dialog-header-colors no-padding no-margin">
                <div class="flex-container-row">
                    <div class="full-height padded title-size" style="width: 95%;">{{protocol.name}}
                    </div>
                    <div class="right-align">
                        <button mat-button mat-dialog-close>&times;</button>
                    </div>
                </div>
            </div>
            <div mat-dialog-content class="flex-grow no-padding no-margin">
                <div class="full-width full-height flex-container-col padded">
                    <div *ngIf="hasAdapters" class="full-width flex-container-row"
                         style="text-align: left; height: 33%">
                        <div class="full-width flex-container-col">
                            <div class="full-width flex-container-row padded">
                                <div class="label label-width flex-nowrap">Read 1 Adapter</div>
                                <div class="flex-grow">
                                    <textarea class="full-width full-height minor-width flex-nowrap"
                                              disabled>{{protocol.adapterSequenceThreePrime}}
                                    </textarea>
                                </div>
                            </div>
                            <div class="full-width flex-container-row padded">
                                <div class="label label-width flex-nowrap ">Read 2 Adapter</div>
                                <div class="flex-grow">
                                    <textarea class="full-width full-height minor-width flex-nowrap"
                                              disabled>{{protocol.adapterSequenceFivePrime}}
                                    </textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="full-width full-height flex-container-row padded-top"
                         style="text-align: left;">
                        <div class="full-width flex-grow">
                            <textarea class="full-width full-height"
                                      disabled>{{protocol.description}}
                            </textarea>
                        </div>
                    </div>

                </div>
            </div>
            <div mat-dialog-actions class="no-padding no-margin">
                <div class="full-width right-align flex-container-row padded">
                    <div class="full-height flex-grow">
                    </div>
                    <div>
                        <button mat-button mat-dialog-close>Close</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        textarea {
            resize: none;
            background-color: white;
        }
        
        .no-margin {
            margin: 0;
        }
        
        .no-padding {
            padding: 0;
        }
        
        .title-size {
            font-size: large;
        }
        
        .label-width {
            min-width: 8rem;
        }
       
        .minor-width {
            min-width: 7rem;
        }
    `],
})
export class ProtocolDialogComponent implements OnInit, AfterViewInit {
    public protocol: any;
    public hasAdapters: boolean = false;
    
    constructor(private dialogRef: MatDialogRef<ProtocolDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {
    }
    
    ngOnInit(): void {
        if (!this.data || !this.data.protocol) {
            this.dialogRef.close();
        }
        
        this.protocol = Array.isArray(this.data.protocol) ? this.data.protocol[0] : this.data.protocol;
        this.hasAdapters = this.data.protocol.hasAdapters === "Y";
    
    }
    
    ngAfterViewInit(): void {
    }
    
}
