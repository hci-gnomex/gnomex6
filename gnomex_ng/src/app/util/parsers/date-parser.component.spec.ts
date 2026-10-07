import {DateParserComponent} from "./date-parser.component";

describe("DateParserComponent", () => {

    const isoToUs = (): DateParserComponent => new DateParserComponent(
        DateParserComponent.DEFAULT_RECEIVED_DATE_FORMAT, DateParserComponent.DEFAULT_DISPLAY_DATE_FORMAT);

    it("converts the server date format to the display format", () => {
        expect(isoToUs().parseDateString("2024-03-07")).toBe("03/07/2024");
        expect(isoToUs().parseDateString("1999-12-31")).toBe("12/31/1999");
    });

    it("pads single-digit days and months for two-digit output", () => {
        const parser: DateParserComponent = new DateParserComponent("M/D/YYYY", "MM/DD/YYYY");
        expect(parser.parseDateString("3/7/2024")).toBe("03/07/2024");
        expect(parser.parseDateString("11/25/2024")).toBe("11/25/2024");
    });

    it("reorders fields between formats", () => {
        const parser: DateParserComponent = new DateParserComponent("MM/DD/YYYY", "YYYY-MM-DD");
        expect(parser.parseDateString("03/07/2024")).toBe("2024-03-07");
    });

    it("returns empty string for empty input", () => {
        expect(isoToUs().parseDateString("")).toBe("");
        expect(isoToUs().parseDateString(null)).toBe("");
    });

    it("returns input unchanged when it does not match the source format", () => {
        expect(isoToUs().parseDateString("2024/03/07")).toBe("2024/03/07");
        expect(isoToUs().parseDateString("not a date")).toBe("not a date");
    });

    describe("format validation", () => {
        it("accepts the default formats", () => {
            const parser: DateParserComponent = isoToUs();
            expect(parser.isFromFormatValid).toBe(true);
            expect(parser.isToFormatValid).toBe(true);
        });

        const invalidFormats: string[] = [
            "MM-DD-MM",   // repeated block
            "MMDDYYYY",   // no separators
            "MM-DD-YY",   // two-digit year
            "MMM-DD-YYYY",
            "MM-DD-2YYYY",
        ];
        for (const format of invalidFormats) {
            it(`rejects "${format}" and passes input through`, () => {
                const parser: DateParserComponent = new DateParserComponent(format, "MM/DD/YYYY");
                expect(parser.isFromFormatValid).toBe(false);
                expect(parser.parseDateString("2024-03-07")).toBe("2024-03-07");
            });
        }
    });
});
