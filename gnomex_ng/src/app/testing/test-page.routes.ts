import {Routes, RouterModule} from "@angular/router";
import {TestPageComponent} from "./test-page.component";
import {RouteGuardService} from "../auth/route-guard.service";

const ROUTES: Routes = [
	{path: "testpageland", component: TestPageComponent, canActivate: [RouteGuardService]}
];

export const TESTPAGE_ROUTING = RouterModule.forChild(ROUTES);