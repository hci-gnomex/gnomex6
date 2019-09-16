import {AfterViewInit, Component, Input, OnInit, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder, Validators, FormControl} from "@angular/forms"
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";


@Component({
    selector:'dt-summary-tab',
    templateUrl:'./datatracks-summary-tab.component.html',
    styles:[`
        :host /deep/ angular-editor #editor {
            resize: none;
        }
        :host /deep/ angular-editor .angular-editor-button[title="Insert Image"] {
            display: none;
        }
    `]

})
export class DatatracksSummaryTabComponent implements OnInit {
    //Override
    public showSpinner: boolean = false;
    public editorConfig: AngularEditorConfig;
    public summaryFormGroup: FormGroup;
    description: string = "";
    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;
    @Input() private editable: boolean = false;



    constructor(protected fb: FormBuilder, private dtService: DataTrackService,
                private orderValidateService: BrowseOrderValidateService,
                private route: ActivatedRoute) {
    }



    ngOnInit():void{
        this.editorConfig = {
            spellcheck: true,
            height: "25em",
            minHeight: "10em",
            enableToolbar: true,
        };

        this.summaryFormGroup=  this.fb.group({
            folderName:[ '', [ Validators.required, Validators.maxLength(100)]],
            summary:['', [ Validators.maxLength(5000)]],
            description:''
        });

        this.route.data.forEach(params =>{
            this.orderValidateService.dirtyNote = false;
            let folderName = this.dtService.datatrackListTreeNode.name;
            let summary = this.dtService.datatrackListTreeNode.summary;
            let description = this.dtService.datatrackListTreeNode.description;

            this.summaryFormGroup.get("folderName").setValue(folderName);
            this.summaryFormGroup.get("summary").setValue(summary);
            this.summaryFormGroup.get("description").setValue(description);
        });

        this.summaryFormGroup.markAsPristine();
        if(this.editable) {
            this.summaryFormGroup.enable();
            this.editorConfig.editable = true;
            this.editorConfig.showToolbar = true;
        } else {
            this.summaryFormGroup.disable();
            this.editorConfig.editable = false;
            this.editorConfig.showToolbar = false;
        }

    }

}




