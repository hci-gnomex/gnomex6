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

  // Maps route URL segments to human-readable page titles (WCAG 2.4.2)
  private static readonly ROUTE_TITLES: {[key: string]: string} = {
    "home":            "Home — GNomEx",
    "authenticate":    "Sign In — GNomEx",
    "experiments":     "Experiments — GNomEx",
    "analysis":        "Analysis — GNomEx",
    "datatracks":      "Data Tracks — GNomEx",
    "topics":          "Topics — GNomEx",
    "billing":         "Billing — GNomEx",
    "products":        "Products — GNomEx",
    "reports":         "Reports — GNomEx",
    "workflow":        "Workflow — GNomEx",
    "configuration":   "Configuration — GNomEx",
    "usersGroups":     "Users & Groups — GNomEx",
    "upload":          "Upload — GNomEx",
  };


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
        const segment = e.urlAfterRedirects.split("/").find(s => s && !s.startsWith("?")) || "home";
        const title = GnomexAppComponent.ROUTE_TITLES[segment] || "GNomEx";
        this.titleService.setTitle(title);
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

  skipToMain(): void {
    const nav = document.getElementById('main-nav');
    if (!nav) { return; }

    const firstFocusable = nav.querySelector<HTMLElement>(
      'button:not([disabled]):not([hidden]), a[href]'
    );

    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      nav.setAttribute('tabindex', '-1');
      nav.focus();
    }
  }

}
