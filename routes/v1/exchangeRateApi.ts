import * as express from 'express';
import { Request, Response } from 'express';
import multer from 'multer';
import axios from 'axios';

export default class ExchangeRateApi {
    // URL of coinbase API to get current prices of 1 ETH
    currencyApiUrl: string =
        'https://api.coinbase.com/v2/exchange-rates?currency=ETH';
    // Threshold time before re-query for updated prices in minutes
    thresholdTime: number = 1;
    currentPriceList: any;
    lastQueryTime: number;
    defaultCurrency: string = 'SGD';

    constructor() {
        this.lastQueryTime = Date.now();
    }

    checkIfThresholdTimeOver() {
        const timeDifference = Date.now() - this.lastQueryTime;
        const elapsedMinutes = Math.floor(timeDifference / 60000);
        console.log(`Elapsed minutes since last reading: ${elapsedMinutes}`);
        return elapsedMinutes >= this.thresholdTime ? true : false;
    }

    async getNewPrice() {
        try {
            const response = await axios.get(this.currencyApiUrl);
            const responseData = response.data;
            this.currentPriceList = responseData.data.rates;
            // Update query time
            this.lastQueryTime = Date.now();
            console.log(this.currentPriceList);
            console.log('Pricelist updated');
        } catch (err: any) {
            console.log(
                'An error has occurred retrieving the new ethereum price - Prices may be outdated'
            );
            console.log(err.message);
            throw new Error(err.message);
        }
    }

    convertCurrency(ethereumAmount: string, targetCurrency: string) {
        // Default target currency will be SGD
        console.log(`Target currency: ${targetCurrency}`);
        const targetCurrencyPrice = parseFloat(
            this.currentPriceList[targetCurrency]
        );
        if (isNaN(targetCurrencyPrice)) {
            console.log(`Target currency: ${targetCurrency} does not exist`);
            throw new Error(
                `Unable to get target currency amount - target currency ${targetCurrency} does not exist`
            );
        }
        return targetCurrencyPrice * parseFloat(ethereumAmount);
    }

    public routes(router: express.Router): void {
        router.get(
            '/convert',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    const ethereumAmount = req.body.ethereumAmount;
                    const targetCurrency =
                        req.body.targetCurrency || this.defaultCurrency;
                    const priceIsExpired = this.checkIfThresholdTimeOver();

                    if (priceIsExpired || this.currentPriceList === undefined) {
                        await this.getNewPrice();
                    }

                    const convertedPrice = this.convertCurrency(
                        ethereumAmount,
                        targetCurrency
                    );
                    res.send({
                        isOk: true,
                        message: 'Currency successfully converted',
                        convertedPrice: convertedPrice,
                    }).status(200);
                } catch (err: any) {
                    res.send({
                        message: err.message,
                    }).status(403);
                }
            }
        );
    }
}
