import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {TreeModule} from "angular-tree-component";
import {RelatedDataTabComponent} from "./related-data-tab.component";
import {ServicesModule} from "../services/services.module";
import {AngularMaterialModule} from "../../modules/angular-material.module";



/**
 * @author Erik Rasmussen
 */


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ServicesModule,
        TreeModule.forRoot(),
        AngularMaterialModule

    ],
    declarations: [
        RelatedDataTabComponent
    ],
    exports:[
        RelatedDataTabComponent
    ]
})
export class RelatedDataModule {
}