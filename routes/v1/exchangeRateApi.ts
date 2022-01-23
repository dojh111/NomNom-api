import * as express from 'express';
import { Request, Response } from 'express';
import multer from 'multer';
import ExchangeRateHandler from './exchangeRateHandler';

export default class ExchangeRateApi extends ExchangeRateHandler {
    constructor() {
        super();
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
                    const convertedPrice = await this.convertCurrency(
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

        router.get(
            '/convert/test',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    const amount = req.body.amount;
                    const convertedPrice = await this.convertSGDToWEI(amount);
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
