
import {Component,OnInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ExperimentsService} from "../experiments.service";


@Component({
    template: `
        <div> I am progress </div>
    `
})
export class ProgressBrowseTab extends PrimaryTab implements OnInit{
    name = "Progress";
    private rpSolexaList: Array<any>;
    private rpDNASeqList:Array<any>;
    private rpList:Array<any>;

    constructor(protected fb: FormBuilder,private experimentService:ExperimentsService) {
        super(fb);
    }

    ngOnInit(){
        this.experimentService.getRequestProgressListObservable()
            .subscribe(data =>{
                console.log("populated the response for getRequestProgressList");
                this.rpList = data;
            });
        this.experimentService.getRequestProgressDNASeqListObservable()
            .subscribe((data)=>{
                console.log("populated the response for getRequestProgressDNASeqList");
                this.rpDNASeqList = data;
                console.log(data);
            });
        this.experimentService.getRequestProgressSolexaListObservable()
            .subscribe(data =>{
                console.log("populated the response for getRequestProgressSolexaList");
                this.rpSolexaList = data;
                console.log(data);
            });
    }

}
