import {HttpParams} from "@angular/common/http";
import {HttpUriEncodingCodec} from "./http-uri-encoding-codec";

describe("HttpUriEncodingCodec", () => {
    const codec: HttpUriEncodingCodec = new HttpUriEncodingCodec();

    it("encodes characters Angular's default codec leaves alone", () => {
        expect(codec.encodeValue("a+b")).toBe("a%2Bb");
        expect(codec.encodeValue("x@y.org")).toBe("x%40y.org");
        expect(codec.encodeValue("a=b&c")).toBe("a%3Db%26c");
        expect(codec.encodeKey("my key")).toBe("my%20key");
    });

    it("round-trips values", () => {
        const raw: string = "Name +/& µl ?=";
        expect(codec.decodeValue(codec.encodeValue(raw))).toBe(raw);
        expect(codec.decodeKey(codec.encodeKey(raw))).toBe(raw);
    });

    it("produces a safe query string through HttpParams", () => {
        const params: HttpParams = new HttpParams({encoder: codec}).set("email", "j+doe@utah.edu");
        expect(params.toString()).toBe("email=j%2Bdoe%40utah.edu");
    });
});
