import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {IRegisterUser, ISimpleCoreFacility} from "../../util/interfaces/register-user.model";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";

@Component({

  template: `

    <div class="flex-container-col padded align-center container">
      <div class="flex-container-row full-width justify-space-between header">
        <img [src]="siteLogo" alt="Site logo">
        <div class="spaced-children">
          <a [routerLink]="['/authenticate']" >Sign in</a>
          <span>|</span>
          <a [routerLink]="['/reset-password']" >Reset password  </a>
        </div>
      </div>
      <br><p>Please click on the core of interest to begin.</p>
      <br><p class="approval-notice">Your GNomEx account will not work until you receive an approval email.</p>
      <div class="flex-container-col align-center flex-grow">
        <div class="flex-container-col align-center flex-grow border-subtle login-background main-form" >
          <table border="0"  rules="rows">
            <ng-container *ngFor="let core of this.coreFacilities" >
              <tr >
                <td style="padding-bottom:1em; padding-top:1em; padding-right: 1em;">
                  <a [routerLink]="['/register-user', core.idCoreFacility]" >{{core.display}}</a>
                </td>

                <td style="padding-bottom:1em; padding-top:1em">
                  <div [innerHTML]="core.description" > </div>
                </td>
              </tr>
            </ng-container>
          </table>
        </div>
      </div>

    </div>
  `
  ,
  styleUrls: ["./select-core.component.scss"]
})
export class SelectCoreComponent  implements OnInit, OnDestroy{
  public coreFacilities: ISimpleCoreFacility[];
  public siteLogo:string;


  constructor(private route:ActivatedRoute, private dialogService:DialogsService) {
  }

  ngOnInit():void{

    this.route.data.forEach( resp =>{
      if(resp  && resp.registerUserInfo) {
        let regUserResp: any = resp.registerUserInfo;
        if (regUserResp.result === "SUCCESS") {
          let registerUser = <IRegisterUser>regUserResp;
          this.coreFacilities = registerUser.CoreFacilities;
          this.siteLogo = registerUser.siteLogo;
          console.log(this.coreFacilities);
        } else if (regUserResp.message) {
          this.dialogService.alert(regUserResp.message, "", DialogType.FAILED);
        }
      }
    })


  }

  ngOnDestroy(){
  }


}
