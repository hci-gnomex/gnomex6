
import {AfterViewInit,Component, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {URLSearchParams} from "@angular/http";
import {jqxEditorComponent} from "../../../assets/jqwidgets-ts/angular_jqxeditor";
import {DatatrackDetailOverviewService} from "./datatrack-detail-overview.service";




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
    private labList:Array<string> = [];
    private idLabString: string;
    @ViewChild('editorReference') myEditor: jqxEditorComponent;




    constructor(protected fb: FormBuilder,private dtService: DataTrackService,
                private route: ActivatedRoute,private secAdvisor: CreateSecurityAdvisorService,
                private dtOverviewService : DatatrackDetailOverviewService){
    }



    ngOnInit():void{ // Note this hook runs once if route changes to another folder you don't recreate component
        this.edit = !this.secAdvisor.isGuest;


        this.summaryFormGroup=  this.fb.group({
            folderName:[ '', [ Validators.required, Validators.maxLength(100)]],
            summary:['', [ Validators.maxLength(5000)]],
            description:['']
        });
        if(!this.edit){
            this.toolBarSettings = '';
            this.summaryFormGroup.disable();
        }else{
            this.toolBarSettings = this.tbarSettings;
        }


        this.dtOverviewService.addFormToParent("summaryFormGroup", this.summaryFormGroup);

        this.route.paramMap.forEach(params =>{


            let folderName = this.dtService.datatrackListTreeNode.name;
            let summary = this.dtService.datatrackListTreeNode.summary;

            this.summaryFormGroup.get("folderName").setValue(folderName);
            this.summaryFormGroup.get("summary").setValue(summary);
            this.summaryFormGroup.markAsPristine();

        });

    }

    ngAfterViewInit():void{


        this.route.paramMap.forEach(params =>{
            let description = this.dtService.datatrackListTreeNode.description;
            this.myEditor.val(description);
        });
    }

    save():void{
        this.showSpinner = true;
        let params:URLSearchParams = new URLSearchParams();
        let idDataTrackFolder = this.dtService.datatrackListTreeNode.idDataTrackFolder;
        let name = this.summaryFormGroup.get('folderName').value;
        let descript = this.myEditor.val;


        params.set('idDataTrackFolder', idDataTrackFolder);
        params.set('description', '');
        params.set('name', name);
        params.set('idLab',this.idLabString);
        this.dtService.saveFolder(params).subscribe(resp =>{
            this.summaryFormGroup.markAsPristine();
            this.showSpinner = false;
            this.dtService.getDatatracksList_fromBackend(this.dtService.previousURLParams);
        });
    }


}




