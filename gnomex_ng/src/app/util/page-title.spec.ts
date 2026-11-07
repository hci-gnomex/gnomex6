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
        expect(pageTitleFor("/manage-protocols(browsePanel:details/12)")).toBe(DEFAULT_TITLE);
    });
});
