import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {TreeModule} from "@circlon/angular-tree-component";
import {RelatedDataTabComponent} from "./related-data-tab.component";
import {ServicesModule} from "../services/services.module";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {AccessibilityModule} from "./accessibility/accessibility.module";



/**
 * @author Erik Rasmussen
 */


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ServicesModule,
    TreeModule,
    AngularMaterialModule,
    AccessibilityModule

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
