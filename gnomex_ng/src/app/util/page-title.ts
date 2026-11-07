import {DefaultUrlSerializer} from "@angular/router";

export const DEFAULT_TITLE: string = "GNomEx";

/**
 * Page names by the first segment of the route, exactly as spelled in the *.routes.ts files (they
 * are case-sensitive: "UsersGroups", "qcWorkFlow"). Names follow the header menu items that open
 * them. Dialog routes in the modal outlet (newProject, BulkSampleUpload...) don't change the page,
 * so they keep the title of the page underneath.
 */
const PAGE_NAMES: {[segment: string]: string} = {
    // Signing in and the user's account
    "authenticate":                  "Sign In",
    "register-user":                 "Sign Up",
    "reset-password":                "Reset Password",
    "change-password":               "Change Password",
    "logout-loader":                 "Signing Out",
    "MyAccount":                     "My Account",
    "home":                          "Home",

    // Experiments
    "experiments":                   "Experiments",
    "experiments-orders":            "Orders",
    "newExperiment":                 "New Experiment Order",
    "new-external-experiment":       "Upload Experiment Data",
    "amend-experiment":              "Add Illumina Sequencing Lanes",

    // Browse pages
    "analysis":                      "Analysis",
    "datatracks":                    "Data Tracks",
    "topics":                        "Topics",
    "manage-protocols":              "Protocols",

    // Workflow
    "qcWorkFlow":                    "QC Workflow",
    "libprepWorkFlow":               "Illumina Lib Prep Workflow",
    "libprepQcWorkFlow":             "Illumina Lib Prep QC Workflow",
    "flowcellassmWorkFlow":          "Illumina Flow Cell Assembly Workflow",
    "finalizeWorkFlow":              "Illumina Finalize Flow Cell Workflow",
    "pipelineWorkFlow":              "Illumina Data Pipeline Workflow",
    "flowcellWorkFlow":              "Illumina Flow Cells Workflow",

    // Billing and products
    "browse-billing":                "Billing",
    "product-orders":                "Product Orders",
    "product-ledger":                "Product Ledger",
    "order-products":                "Order Products",
    "configure-products":            "Configure Products",

    // Administration
    "UsersGroups":                   "Users & Groups",
    "browse-dictionary":             "Dictionaries",
    "editDictionary":                "Dictionaries",
    "configure-core-facility":       "Configure Core Facilities",
    "configure-annotations":         "Configure Annotations",
    "configure-experiment-platform": "Configure Experiment Platform",
    "configure-organisms":           "Configure Organisms and Genome Builds",

    // Reports
    "TrackUsage":                    "Track Usage",
    "AnnotationReport":              "Annotation Report",
    "AnnotationProgressReport":      "Annotation Progress Report",
    "ProjectExperimentReport":       "Project/Experiment Report",
};

/** Browser tab titles by the first segment of the route (WCAG 2.4.2 Page Titled). */
export const ROUTE_TITLES: {[segment: string]: string} = Object.keys(PAGE_NAMES).reduce(
    (titles: {[segment: string]: string}, segment: string) => {
        titles[segment] = PAGE_NAMES[segment] + " — " + DEFAULT_TITLE;
        return titles;
    }, {});

const serializer: DefaultUrlSerializer = new DefaultUrlSerializer();

/**
 * The title for a router URL. Uses Angular's own URL parser, so the query string
 * ("/experiments?expRadio=myLab"), fragment, matrix parameters and secondary outlets are not
 * mistaken for part of the page name. "/" counts as Home.
 */
export function pageTitleFor(url: string): string {
    let segment: string = "home";
    try {
        const primary = serializer.parse(url).root.children["primary"];
        if (primary && primary.segments.length > 0) {
            segment = primary.segments[0].path;
        }
    } catch (e) {
        return DEFAULT_TITLE;
    }
    return ROUTE_TITLES[segment] || DEFAULT_TITLE;
}
