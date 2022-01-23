import axios from 'axios';
import Web3 from 'web3';

export default class ExchangeRateHandler {
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
            // console.log(this.currentPriceList);
            console.log('Pricelist updated');
        } catch (err: any) {
            console.log(
                'An error has occurred retrieving the new ethereum price - Prices may be outdated'
            );
            console.log(err.message);
            throw new Error(err.message);
        }
    }

    async checkPriceValidity() {
        const priceIsExpired = this.checkIfThresholdTimeOver();
        if (priceIsExpired || this.currentPriceList === undefined) {
            console.log('Getting new price table');
            await this.getNewPrice();
        }
    }

    async convertCurrency(ethereumAmount: string, targetCurrency: string) {
        await this.checkPriceValidity();
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

    async convertSGDToWEI(amount: string) {
        await this.checkPriceValidity();
        // Target amount will be SGD
        const targetCurrencyPrice = Number.parseFloat(
            this.currentPriceList.SGD
        );
        const SGD1toETH = (1 / targetCurrencyPrice).toPrecision(6);
        const etherString = (
            parseFloat(amount) * parseFloat(SGD1toETH)
        ).toPrecision(6);
        console.log(etherString);
        const weiValue = Web3.utils.toWei(etherString, 'ether');
        console.log(weiValue);
        return weiValue;
    }
}
