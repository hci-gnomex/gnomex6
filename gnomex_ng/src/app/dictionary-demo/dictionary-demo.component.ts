import {Component, ViewChild} from "@angular/core";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DictionaryService} from "../services/dictionary.service";
import {jqxComboBox} from "jqwidgets-framework";
import {jqxComboBoxComponent} from "jqwidgets-framework";

@Component({
    selector: "dictionary-demo",
    templateUrl: "./dictionary-demo.component.html"
})

export class DictionaryDemoComponent {

    private types: any[];
    private entries: any[];
    private coreFacilities: any[];

    @ViewChild("type") type: jqxComboBoxComponent;
    @ViewChild("entry") entry: jqxComboBoxComponent;
    @ViewChild("coreFacility") coreFacility: jqxComboBoxComponent;

    private selectedType = null;
    private selectedEntry = null;
    private selectedJson = "";
    private selectedEntryDisplay = "";
    private reloading = false;

    constructor(private dictionaryService: DictionaryService, private createSecurityAdvisorService: CreateSecurityAdvisorService) {
    }

    onSelectType(): void {
        let newSelectedType = this.getSelectedItem(this.type);
        if (newSelectedType != this.selectedType) {
            this.selectedType = newSelectedType;
            this.loadEntries();
        }
    }

    onSelectEntry(): void {
        this.selectedEntry = this.getSelectedItem(this.entry);
        let display = this.dictionaryService.getEntryDisplay(this.selectedEntry.className, this.selectedEntry.value);
        this.selectedEntryDisplay = "getEntryDisplay(" + this.selectedEntry.className + ", " + this.selectedEntry.value + ") = " + this.selectedEntryDisplay;
        this.selectedJson = JSON.stringify(this.selectedEntry);
    }

    private getSelectedItem(component: jqxComboBoxComponent) {
        if (component != null && component.getSelectedItem() != null) {
            return component.getSelectedItem().originalItem;
        } else {
            return null;
        }
    }

    clearTypes(): void {
        this.types = null;
        this.entries = null;
        this.selectedType = null;
        this.selectedEntry = null;
        this.selectedEntryDisplay = "";
        this.selectedJson = "";
    }

    loadAllTypes(): void {
        this.clearTypes();
        this.types = this.dictionaryService.getAllDictionaries();
    }

    loadEditableTypes(): void {
        this.clearTypes();
        this.types = this.dictionaryService.getEditableDictionaries();
    }

    loadEntries(): void {
        this.entries = null;
        this.selectedEntry = null;
        this.selectedEntryDisplay = "";
        this.selectedJson = "";
        if (this.selectedType) {
            this.entries = this.dictionaryService.getEntries(this.selectedType.className);
        }
    }

    loadCoreFacilities(): void {
        this.coreFacilities = this.dictionaryService.coreFacilities();
    }

    loadCoreFacilitiesExcludeBlank(): void {
        this.coreFacilities = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.CORE_FACILITY);
    }

    reloadDictionaries(): void {
        this.reloading = true;
        this.dictionaryService.reload(() => {
            this.reloading = false;
        });

        this.dictionaryService.reload();

        let cf = null;
        this.dictionaryService.reload(() => {
            cf = this.dictionaryService.getEntries(DictionaryService.CORE_FACILITY);
        });

    }

    private coreSecurityText: string;

    testCoreSecurity() {
        let output = "myCoreFacilities";
        output += this.coreFacilitiesString(this.createSecurityAdvisorService.myCoreFacilities);
        output += ", coreFacilitiesICanSubmitTo";
        output += this.coreFacilitiesString(this.createSecurityAdvisorService.coreFacilitiesICanSubmitTo);
        output += ", coreFacilitiesICanManage";
        output += this.coreFacilitiesString(this.createSecurityAdvisorService.coreFacilitiesICanManage);
        this.coreSecurityText = output;
    }

    private coreFacilitiesString(coreFacilities: any[]) {
        let output: string = "";
        for (let coreFacility of coreFacilities) {
            if (output.length > 0) {
                output += "-";
            }
            output += coreFacility.idCoreFacility;
        }
        return "[" + output + "]";
    }

}
