import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ProgressService {
    public hideLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /**
     * Progress complete
     * @type {BehaviorSubject<number>}
     */
    public loaderStatus: BehaviorSubject<number> = new BehaviorSubject<number> (0);
    hideLoaderStatus(value: boolean) {
        this.hideLoader.next(value);
    }

    /**
     * Increment the progress
     * @param {number} value
     */
    displayLoader(value: number) {
        if (value > this.loaderStatus.getValue()) {
            this.loaderStatus.next(value);
        }
    }
}