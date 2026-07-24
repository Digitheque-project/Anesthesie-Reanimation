import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export interface ArticlePharmacie {
    id: string;
    dci: string;
    dosage: string;
    conditionnement: string;
    sale_price: number;
    stock_total: number;
    stock_minimum: number;
    stock_safety: number;
}
export declare class PharmacieClient {
    private readonly http;
    private readonly config;
    private readonly logger;
    private readonly baseUrl;
    private cache;
    constructor(http: HttpService, config: ConfigService);
    getStockSalePrices(): Promise<ArticlePharmacie[]>;
}
