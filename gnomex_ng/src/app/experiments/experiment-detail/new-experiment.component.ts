/**
 * Created by u6008750 on 5/12/2017.
 */
import 'rxjs/add/operator/switchMap';
import {Component, OnInit,ViewChild} from "@angular/core";
import {ExperimentsService} from "../experiments.service";
import {Request} from "@angular/http";

import {TabsStatusEvent,TabContainer} from "../../util/tabs/"

@Component({

    template: `
    <div>
        <tab-container
                [state]="state"
                (tabStatusChanged)="changeStatus()">
        </tab-container>
    </div>
    `


})

export class NewExperimentComponent implements OnInit {
    state:string = TabContainer.NEW;



    constructor(private experimentsService: ExperimentsService) {

    }

    ngOnInit(): void {
    }
    changeStatus(){
        //console.log("Please Look");
    }



}
