import {GnomexStringUtilService} from "./gnomex-string-util.service";

describe("GnomexStringUtilService", () => {

    describe("cleanRichTextHTML", () => {
        it("removes legacy Flex TEXTFORMAT and FONT tags", () => {
            const flex: string = '<TEXTFORMAT LEADING="2"><P ALIGN="LEFT"><FONT FACE="Arial" SIZE="12">Hi</FONT></P></TEXTFORMAT>';
            expect(GnomexStringUtilService.cleanRichTextHTML(flex)).toBe('<P ALIGN="LEFT">Hi</P>');
        });
    });

    describe("stripHTMLText", () => {
        it("removes paragraph, bold, underline, italic and list tags", () => {
            expect(GnomexStringUtilService.stripHTMLText("<P>one <B>two</B> <U>three</U> <I>four</I></P><LI>five</LI>"))
                .toBe("one two three fourfive");
        });

        it("also removes Flex font wrappers", () => {
            expect(GnomexStringUtilService.stripHTMLText('<TEXTFORMAT><P><FONT SIZE="10">x</FONT></P></TEXTFORMAT>'))
                .toBe("x");
        });

        it("only strips upper-case tags (current behaviour)", () => {
            expect(GnomexStringUtilService.stripHTMLText("<p>lower</p>")).toBe("<p>lower</p>");
        });

        it("leaves plain text alone", () => {
            expect(GnomexStringUtilService.stripHTMLText("no tags here")).toBe("no tags here");
        });
    });
});
