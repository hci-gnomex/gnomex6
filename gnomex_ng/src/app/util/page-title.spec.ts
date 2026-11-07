import {DEFAULT_TITLE, pageTitleFor} from "./page-title";

describe("pageTitleFor", () => {

    it("names the page from the first route segment", () => {
        expect(pageTitleFor("/home")).toBe("Home — GNomEx");
        expect(pageTitleFor("/experiments")).toBe("Experiments — GNomEx");
        expect(pageTitleFor("/analysis/detail/7800?idLab=1698&idAnalysisGroup=2271")).toBe("Analysis — GNomEx");
    });

    // The Experiments list opens at /experiments?expRadio=myLab; the query string used to be read as
    // part of the page name, so the tab said just "GNomEx".
    it("ignores a query string straight after the page name", () => {
        expect(pageTitleFor("/experiments?expRadio=myLab")).toBe("Experiments — GNomEx");
        expect(pageTitleFor("/datatracks?idLab=1125&isVisibilityPublic=Y")).toBe("Data Tracks — GNomEx");
        expect(pageTitleFor("/home?topicNumber=11")).toBe("Home — GNomEx");
    });

    it("ignores fragments, matrix parameters and secondary outlets", () => {
        expect(pageTitleFor("/topics#top")).toBe("Topics — GNomEx");
        expect(pageTitleFor("/topics;idLab=7")).toBe("Topics — GNomEx");
        expect(pageTitleFor("/experiments/(browsePanel:overview)")).toBe("Experiments — GNomEx");
    });

    it("treats the root as Home", () => {
        expect(pageTitleFor("/")).toBe("Home — GNomEx");
        expect(pageTitleFor("/?requestNumber=S1261R")).toBe("Home — GNomEx");
    });

    it("falls back to the plain app name for pages it doesn't know", () => {
        expect(pageTitleFor("/no-such-page")).toBe(DEFAULT_TITLE);
        expect(pageTitleFor("/testpageland")).toBe(DEFAULT_TITLE);
    });

    // Route paths are case-sensitive and several menu pages used to have none or a misspelt entry
    // ("usersGroups", "billing", "workflow"...), so these pages were all titled just "GNomEx".
    it("titles the menu pages by their real route paths", () => {
        const expected: {[url: string]: string} = {
            "/UsersGroups":                                   "Users & Groups — GNomEx",
            "/browse-billing?idCoreFacility=1":               "Billing — GNomEx",
            "/manage-protocols/(browsePanel:details/12)":     "Protocols — GNomEx",
            "/qcWorkFlow":                                    "QC Workflow — GNomEx",
            "/pipelineWorkFlow":                              "Illumina Data Pipeline Workflow — GNomEx",
            "/experiments-orders":                            "Orders — GNomEx",
            "/newExperiment/1":                               "New Experiment Order — GNomEx",
            "/new-external-experiment":                       "Upload Experiment Data — GNomEx",
            "/product-ledger":                                "Product Ledger — GNomEx",
            "/configure-organisms":                           "Configure Organisms and Genome Builds — GNomEx",
            "/browse-dictionary":                             "Dictionaries — GNomEx",
            "/ProjectExperimentReport":                       "Project/Experiment Report — GNomEx",
            "/MyAccount":                                     "My Account — GNomEx",
            "/register-user/1":                               "Sign Up — GNomEx",
        };
        Object.keys(expected).forEach((url: string) => expect(pageTitleFor(url)).toBe(expected[url], url));
    });

    it("keeps the page's own title while a dialog route is open", () => {
        expect(pageTitleFor("/experiments(modal:newProject)")).toBe("Experiments — GNomEx");
        expect(pageTitleFor("/home(modal:BulkSampleUpload)")).toBe("Home — GNomEx");
    });

    it("has no entries for paths that aren't routes", () => {
        for (const stale of ["billing", "products", "reports", "workflow", "configuration", "usersGroups", "upload"]) {
            expect(pageTitleFor("/" + stale)).toBe(DEFAULT_TITLE, stale);
        }
    });
});
