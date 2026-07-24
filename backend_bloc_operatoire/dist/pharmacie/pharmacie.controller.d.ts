import { PharmacieClient } from '../external/pharmacie.client';
export declare class PharmacieController {
    private readonly pharmacieClient;
    constructor(pharmacieClient: PharmacieClient);
    getPrix(): Promise<import("../external/pharmacie.client").ArticlePharmacie[]>;
}
