
import {AfterViewInit, Component, Input, OnInit, ViewChild} from "@angular/core";
import {FormGroup, FormBuilder, Validators, FormControl} from "@angular/forms"
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {URLSearchParams} from "@angular/http";
import {jqxEditorComponent} from "../../../assets/jqwidgets-ts/angular_jqxeditor";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";




@Component({
    selector:'dt-summary-tab',
    templateUrl:'./datatracks-summary-tab.component.html'
})
export class DatatracksSummaryTabComponent implements OnInit, AfterViewInit{
    //Override
    public showSpinner:boolean = false;
    public readonly tbarSettings :string  ="bold italic underline | left center right |  format font size | color | ul ol | outdent indent";
    private toolBarSettings:string;
    public edit = false;
    public summaryFormGroup: FormGroup;
    @ViewChild('editorReference') myEditor:jqxEditorComponent;
    private _showEditor:boolean = false;
    description:string = "";


    @Input() set showEditor(val:boolean){
        this._showEditor = val;
        setTimeout(()=>{
            if(val){
                this.myEditor.val(this.description);
            }else {
                this.description = this.myEditor.val();
            }
        })


    }
    get showEditor():boolean{
        return this._showEditor;
    }


    constructor(protected fb: FormBuilder,private dtService: DataTrackService,
                private orderValidateService: BrowseOrderValidateService,
                private route: ActivatedRoute,
                private secAdvisor: CreateSecurityAdvisorService){
    }



    ngOnInit():void{ // Note this hook runs once if route changes to another folder you don't recreate component
        this.edit = !this.secAdvisor.isGuest;


        this.summaryFormGroup=  this.fb.group({
            folderName:[ '', [ Validators.required, Validators.maxLength(100)]],
            summary:['', [ Validators.maxLength(5000)]]
        });
        if(!this.edit){
            this.toolBarSettings = '';
            this.summaryFormGroup.disable();
        }else{
            this.toolBarSettings = this.tbarSettings;
        }


        this.route.data.forEach(params =>{
            this.orderValidateService.dirtyNote = false;
            let folderName = this.dtService.datatrackListTreeNode.name;
            let summary = this.dtService.datatrackListTreeNode.summary;

            this.summaryFormGroup.get("folderName").setValue(folderName);
            this.summaryFormGroup.get("summary").setValue(summary);
            this.description = this.dtService.datatrackListTreeNode.description;
            setTimeout(() => {
                this.myEditor.val(this.description);
            })

        });

        this.orderValidateService.getOrderValidateObservable()
            .subscribe(()=>{
                this.orderValidateService.propsNotOnForm["description"] = this.myEditor.val() ;
            });

    }


    editorChanged(event:any){
        this.orderValidateService.dirtyNote = true;
    }


    ngAfterViewInit():void{

    }



}




