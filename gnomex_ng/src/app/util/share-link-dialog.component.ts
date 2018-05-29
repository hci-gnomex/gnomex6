import {Component, ElementRef, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DOCUMENT} from '@angular/platform-browser';

@Component({
    template: `
        
            <mat-dialog-content style="display: flex; flex-direction: column; height: 85%; position: relative">

                <h6 mat-dialog-title>Web Link: {{this.name}}</h6>
                <input style="margin: 1em;" disabled [(ngModel)]="link"/> 
                <button mat-button color="primary" (click)="copyToClipboard(link)">
                    Copy To Clipboard
                </button>
            </mat-dialog-content>
      
        
    `,
})
export class ShareLinkDialogComponent implements OnInit{

    public link: string= '';
    private number:string= '';
    private type:string='';
    public name:string = '';



    constructor(private dialogRef: MatDialogRef<ShareLinkDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private fb:FormBuilder,
                private secAdvisor:CreateSecurityAdvisorService,
                @Inject(Window) private _window: Window ) {

    }

    ngOnInit(){

        this.name = this.data.name;
        this.number = this.data.number;
        this.type = this.data.type;
        this.link = this.makeURL(this.type,this.number);
    }

    makeURL(orderType:string,number:string):string{
        //native javascript
        let baseUrl = `https://${this._window.location.hostname}/gnomex/?${orderType+'='+number}`;
        return baseUrl;
    }

    copyToClipboard(text:string){
        //native javascript
        var event = (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', text);
            e.preventDefault();
            document.removeEventListener('copy', event);
        };
        document.addEventListener('copy', event);
        document.execCommand('copy');
    }
}