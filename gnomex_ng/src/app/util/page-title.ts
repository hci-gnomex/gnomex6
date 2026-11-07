import {DefaultUrlSerializer} from "@angular/router";

/** Browser tab titles by the first segment of the route (WCAG 2.4.2 Page Titled). */
export const ROUTE_TITLES: {[segment: string]: string} = {
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

export const DEFAULT_TITLE: string = "GNomEx";

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
