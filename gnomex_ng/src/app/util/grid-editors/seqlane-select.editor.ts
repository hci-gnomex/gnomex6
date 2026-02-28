import {Component} from "@angular/core";
import {SelectEditor} from "./select.editor";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
    templateUrl: "./select.editor.html",
    styles: [`
        .full-width  { width:  100%; }
        .full-height { height: 100%; }

        .flex-column-container {
            display: flex;
            flex-direction: row;
        }
        .flex-row  {
            display: flex;
        }
        .flex-stretch {
            display:flex;
            flex: 1;
        }
    `]
}) export class SeqlaneSelectEditor extends SelectEditor {
    selectedRequestCategory: string;

    constructor(public dictionaryService: DictionaryService, protected dialog: MatDialog) {
        super(dialog);
    }

    agInit(params: any): void {
        super.agInit(params);
        if(params.node.data.codeRequestCategory === "ILLSEQ") {
            let seqProtocol = this.dictionaryService.getEntry('hci.gnomex.model.NumberSequencingCyclesAllowed', params.node.data.idNumberSequencingCyclesAllowed);
            if(seqProtocol) {
                let name = (<string>seqProtocol.name).split(' ')[0].toUpperCase();
                if(name === "NOVASEQ") {
                    this.selectedRequestCategory = "NOSEQ";
                } else {
                    this.selectedRequestCategory = name;
                }
            }
        } else {
            this.selectedRequestCategory = params.node.data.codeRequestCategory;
        }



        let requestCategory: any = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', this.selectedRequestCategory);
        let solexaFlowCellChannels: number = requestCategory ? requestCategory.numberOfChannels : 0;
        let rLanes: any[] = [];

        let emptyChoice: any = {
            display: "",
            value: ""
        };

        rLanes.push(emptyChoice);

        if(solexaFlowCellChannels) {
            for (var i = 1; i <= solexaFlowCellChannels; i++) {
                let obj = {display: i.toString(), value: i};
                rLanes.push(obj);
            }
        }

        this.options = rLanes;
    }

}
