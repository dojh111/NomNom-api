import * as express from 'express';
import { Request, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import ExchangeRateHandler from './exchangeRateHandler';
import multer from 'multer';
// import ObjectId from 'mongodb';

const uri =
    'mongodb+srv://MinistryOfMetaMask:eF28WeXha7n3Y8DV@cluster0.6i8am.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

type VoucherData = {
    _id?: number;
    supplierName: string;
    walletAddress: string;
    value: number;
    expiryDate: string;
};

export default class Voucher {
    collection: any;
    exchangeRateHandler: ExchangeRateHandler;

    constructor() {
        client.connect((err) => {
            this.collection = client.db('NomNom').collection('Voucher');
        });
        this.exchangeRateHandler = new ExchangeRateHandler();
    }

    async searchDatabase(searchItem: any) {
        const searchResult = await this.collection.find(searchItem);
        const array = await searchResult.toArray();
        console.log(array);
        return array;
    }

    async getDatabase() {
        const searchResult = await this.collection.find();
        const array = await searchResult.toArray();
        // console.log(array);
        return array;
    }

    async checkForDuplicateVoucher(
        supplierName: string,
        value: number,
        expiryDate: string
    ) {
        const currentVouchers: VoucherData[] = await this.searchDatabase({
            supplierName: supplierName,
        });

        for (let voucher of currentVouchers) {
            if (voucher.expiryDate == expiryDate && value == voucher.value) {
                throw new Error('Duplicate Voucher');
            }
        }
    }

    public routes(router: express.Router): void {
        // POST create
        router.post(
            '/supplier/voucher',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    // Set data into database
                    // Check for duplicate voucher name
                    await this.checkForDuplicateVoucher(
                        req.body.supplierName,
                        req.body.value,
                        req.body.expiryDate
                    );
                    const voucherData: VoucherData = {
                        supplierName: req.body.supplierName,
                        walletAddress: req.body.walletAddress,
                        value: req.body.value,
                        expiryDate: req.body.expiryDate,
                    };
                    await this.collection.insertOne(voucherData);
                    const returnData = await this.searchDatabase({
                        supplierName: req.body.supplierName,
                        walletAddress: req.body.walletAddress,
                        value: req.body.value,
                        expiryDate: req.body.expiryDate,
                    });
                    returnData[0].value =
                        await this.exchangeRateHandler.convertSGDToWEI(
                            returnData[0].value
                        );
                    res.send({
                        isOk: true,
                        voucherData: returnData[0],
                        message: 'Voucher listed',
                    }).status(200);
                    return;
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        isOk: false,
                        message: err.message,
                    }).status(500);
                }
            }
        );

        router.get(
            '/voucher/:supplierName',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    const supplierName = req.params.supplierName;
                    // Retrieve details from database
                    const supplierVouchers = await this.searchDatabase({
                        supplierName: supplierName,
                    });
                    if (!supplierVouchers) {
                        throw new Error(
                            `Vouchers ${supplierVouchers} is not found!`
                        );
                    }
                    res.send(supplierVouchers);
                } catch (err: any) {
                    res.send({
                        message: err.message,
                    }).status(403);
                }
            }
        );
    }
}
