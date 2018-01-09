import {Routes, RouterModule} from "@angular/router";
import {TestPageComponent} from "./test-page.component";
import {RouteGuardService} from "@hci/authentication";

const ROUTES: Routes = [
	{path: "testpageland", component: TestPageComponent, canActivate: [RouteGuardService]}
];

export const TESTPAGE_ROUTING = RouterModule.forChild(ROUTES);