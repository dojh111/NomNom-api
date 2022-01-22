import * as express from 'express';
import { Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import multer from 'multer';

const uri =
    'mongodb+srv://MinistryOfMetaMask:eF28WeXha7n3Y8DV@cluster0.6i8am.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export type SupplierData = {
    _id?: number;
    supplierName: string;
    supplierPassword: string;
    supplierEmail: string;
    supplierWalletAddress: string;
    supplierAddress: string;
};

export default class SupplierActions {
    collection: any;

    constructor() {
        client.connect((err) => {
            this.collection = client.db('NomNom').collection('Suppliers');
        });
    }

    async searchDatabase(searchItem: any) {
        const searchResult = await this.collection.find(searchItem);
        const array = await searchResult.toArray();
        return array;
    }

    async checkForDuplicateAttributes(supplierData: SupplierData) {
        // Check if userName (unique), wallet address have been used before
        const supplierNameArray = await this.searchDatabase({
            supplierName: supplierData.supplierName,
        });
        if (supplierNameArray.length > 0) {
            throw new Error('Username already exists');
        }
        // Check email
        const supplierEmailArray = await this.searchDatabase({
            supplierEmail: supplierData.supplierEmail,
        });
        if (supplierEmailArray.length > 0) {
            throw new Error('Email already exists');
        }
        // Check wallet address
        const supplierWalletAddressArray = await this.searchDatabase({
            supplierWalletAddress: supplierData.supplierWalletAddress,
        });
        if (supplierWalletAddressArray.length > 0) {
            throw new Error('Wallet address already exists');
        }
    }

    public routes(router: express.Router): void {
        // POST create
        router.post(
            '/supplier/signup',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    // Set data into database
                    const supplierData: SupplierData = {
                        _id: req.body._id,
                        supplierName: req.body.supplierName,
                        supplierPassword: req.body.supplierPassword,
                        supplierEmail: req.body.supplierEmail,
                        supplierWalletAddress: req.body.supplierWalletAddress,
                        supplierAddress: req.body.supplierAddress,
                    };

                    // No repeats, proceed to insert
                    await this.collection.insertOne(supplierData);
                    res.send({
                        isOk: true,
                        supplierProfile: supplierData,
                        message: 'Supplier sign up successful',
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

        router.post(
            '/supplier/signin',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    const supplierName = req.body.supplierName;
                    const supplierPassword = req.body.supplierPassword;
                    // Retrieve details from database
                    let supplierDetails: SupplierData[] =
                        await this.searchDatabase({
                            userName: supplierName,
                        });
                    // Check if user exists, if not use email
                    if (supplierDetails.length === 0) {
                        console.log('Cannot find username, searching email');
                        supplierDetails = await this.searchDatabase({
                            supplierEmail: supplierName,
                        });
                        if (supplierDetails.length === 0) {
                            throw new Error('User not found');
                        }
                    }
                    // Check if password is correct
                    if (
                        supplierPassword === supplierDetails[0].supplierPassword
                    ) {
                        res.send({
                            loginOk: true,
                            supplierProfile: supplierDetails[0],
                            message: 'Login success',
                        }).status(200);
                    }
                    throw new Error('Login failed - Invalid Password');
                } catch (err: any) {
                    res.send({
                        loginOk: false,
                        message: err.message,
                    }).status(403);
                }
            }
        );
    }
}
