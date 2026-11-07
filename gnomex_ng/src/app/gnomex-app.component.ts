/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, ViewChild, OnInit} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {HeaderComponent} from "./header/header.component";

import {Observable} from "rxjs";
import {filter} from "rxjs/operators";
import {NavigationEnd, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {CreateSecurityAdvisorService} from "./services/create-security-advisor.service";
import {ProgressService} from "./home/progress.service";
import {DictionaryService} from "./services/dictionary.service";
import {AuthenticationService} from "./auth/authentication.service";
import {NavigationService} from "./services/navigation.service";
import {AriaAnnouncerService} from "./util/accessibility/aria-announcer.service";
import {pageTitleFor} from "./util/page-title";

/**
 * The gnomex application component.
 */
@Component({
  selector: "gnomex-app",
  providers: [],
  templateUrl: './gnomex-app.component.html'
})

export class GnomexAppComponent implements OnInit {

  public isCollapsed: boolean = true;
  public status: {isopen: boolean} = {isopen: false};
  public isLoggedIn: boolean;
  objLoaderStatus: boolean;
  private appNameTitle: string = "Gnomex";



  @ViewChild(HeaderComponent)

  private _primaryNavEnabled: Observable<boolean>;


  constructor(private authenticationService: AuthenticationService,
              private createSecurityAdvisorService: CreateSecurityAdvisorService,
              private dictionaryService: DictionaryService,
              private http: HttpClient,
              private progressService: ProgressService,
              private navService: NavigationService,
              private router: Router,
              private titleService: Title,
              // Injected here to ensure the aria-live region is created at app
              // startup (before any drag-and-drop component is loaded).
              // The service self-wires to TreeKeyboardMoveService.announcement$.
              private ariaAnnouncer: AriaAnnouncerService) {
    navService.trackNavState();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.titleService.setTitle(pageTitleFor(e.urlAfterRedirects));
      });
  }


  ngOnInit() {
    let isDone: boolean = false;
    console.log("GnomexAppComponent ngOnInit");
    this.authenticationService.isAuthenticated().subscribe((authenticated: boolean) => {
      console.log("GNOMEX App user is authed ")
      this.isLoggedIn = authenticated;
    });

  }

  /**
   * Moves focus past both header rows to the <main> landmark (WCAG 2.4.1), so the next Tab
   * reaches the page's first control. <main> is only focusable while it holds that focus; a
   * permanent tabindex would let mouse clicks on blank areas focus it.
   */
  skipToMain(): void {
    const main = document.getElementById('main-content');
    if (!main) { return; }

    main.setAttribute('tabindex', '-1');
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
    main.focus();
    main.scrollIntoView({ block: 'start' });
  }

}
