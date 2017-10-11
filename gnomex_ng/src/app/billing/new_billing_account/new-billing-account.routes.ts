/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import { NewBillingAccountComponent } from "./new-billing-account.component";

/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author mbyrne
 * @since 12/19/16
 */
const ROUTES: Routes = [
	{ path: "NewBillingAccount", component: NewBillingAccountComponent }
];

export const NEW_BILLING_ACCOUNT_ROUTING = RouterModule.forChild(ROUTES);
