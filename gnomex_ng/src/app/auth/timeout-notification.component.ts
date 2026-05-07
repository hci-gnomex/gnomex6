import {Component} from "@angular/core";
import {animate, state, style, transition, trigger} from "@angular/animations";

import {Observable, Subscription, timer} from "rxjs";

import {AuthenticationService} from "./authentication.service";
import {map, take} from "rxjs/operators";

@Component({
  selector: "timeout-notification",
  template: `
    <div class="flyout-max" [@openBacksplash]="openState">
      <div class="modal-dialog" [@openModal]="openState" role="document">
        <div class="modal-header">
          <h4 class="modal-title">Your Session Is About To Expire</h4>
        </div>
        <div class="modal-body">
          <p>For your security, your session is about to automatically time out in the next <b>{{seconds | async}}</b> seconds. Would you like to stay signed in?</p>
        </div>
        <div class="modal-footer">
          <ng-container>
            <button id="updateBtn" type="button" class="btn btn-secondary" (click)="click()">Yes, Keep me signed in</button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger("openBacksplash",
      [
        state("in", style({
          "display": "none"
        })),
        state("hidden", style({
          "display": "none"
        })),
        state("opened", style({
          "display": "inherit"
        })),
        transition("hidden => opened", animate(100)),
        transition("opened => hidden", animate(200))
      ]
    ),
    trigger("openModal",
      [
        state("in", style({
          "opacity": "0",
          "left": "-50vw"
        })),
        state("hidden", style({
          "opacity": "0",
          "left": "-50vw"
        })),
        state("opened", style({
          "opacity": "1",
          "left": "25vw"
        })),
        transition("hidden => opened", animate(500)),
        transition("opened => hidden", animate(300))
      ]
    )
  ],
  styleUrls: ['./timeout-notification.component.scss']
})
export class TimeoutNotificationComponent {

  public seconds: Observable<number>;
  public openState: string = "hidden";

  private subscription: Subscription;

  constructor(private authenticationService: AuthenticationService) {
    authenticationService.isAboutToTimeOut().subscribe((isAboutToTimeOut) => {

      if (isAboutToTimeOut) {
        this.openState = "opened";
        this.startCountdown();
      }
      else {
        this.openState = "hidden";
        //If something changed mid-timeout, cancel the timeout/logout.
        if (this.subscription != null && ! this.subscription.closed) {
          this.subscription.unsubscribe;
        }
      }
    });
  }

  startCountdown(): void {
    this.seconds = timer(0, 1000).pipe(take(this.authenticationService.userCountdownSeconds + 1))
      .pipe(map((value)=> this.authenticationService.userCountdownSeconds - value));

    this.subscription = this.seconds.subscribe((value)=> {
       if (value < 1) {
         this.subscription.unsubscribe();
         this.authenticationService.logout(true);
       }
    });
  }

  click(): void {
    this.subscription.unsubscribe();
    this.authenticationService.updateUserActivity();
  }
}
