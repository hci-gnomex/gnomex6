import {Injectable} from "@angular/core";

@Injectable()
export class UniqueIdGeneratorService {
    private nextId: number;

    constructor() {
        this.nextId = 1;
    }

    public generateNextId(): number {
        return this.nextId++;
    }
}