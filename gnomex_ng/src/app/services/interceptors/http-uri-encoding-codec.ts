import {HttpParameterCodec} from "@angular/common/http";

/**
 * A customized HTTP Parameter Codec using encodeURIComponent to handle special characters such as "+".
 *
 */
export class HttpUriEncodingCodec implements HttpParameterCodec {

    encodeKey(key: string): string {
        return encodeURIComponent(key);
    }

    encodeValue(value: string): string {
        return encodeURIComponent(value);
    }

    decodeKey(key: string): string {
        return decodeURIComponent(key);
    }

    decodeValue(value: string): string {
        return decodeURIComponent(value);
    }

}

