import * as express from 'express';
import { Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import multer from 'multer';
import { FriendObject } from './friendsHandler.api';

const uri =
    'mongodb+srv://MinistryOfMetaMask:eF28WeXha7n3Y8DV@cluster0.6i8am.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export type UserData = {
    _id?: number;
    userName: string;
    userPassword: string;
    userEmail: string;
    userWalletAddress: string;
    userDeliveryAddress: string;
    friends: {
        sentRequests: Array<FriendObject>;
        pending: Array<FriendObject>;
        confirmed: Array<FriendObject>;
    };
};

export default class UserActions {
    collection: any;

    constructor() {
        client.connect((err) => {
            this.collection = client.db('NomNom').collection('Users');
        });
    }

    async searchDatabase(searchItem: any) {
        const searchResult = await this.collection.find(searchItem);
        const array = await searchResult.toArray();
        return array;
    }

    async checkForDuplicateAttribute(userData: UserData) {
        const usernameArray = await this.searchDatabase({
            userName: userData.userName,
        });
        if (usernameArray.length > 0) {
            throw new Error('Username already exists');
        }
        // Check email
        const emailArray = await this.searchDatabase({
            userEmail: userData.userEmail,
        });
        if (emailArray.length > 0) {
            throw new Error('Email already exists');
        }
        // Check wallet address
        const walletAddressArray = await this.searchDatabase({
            userWalletAddress: userData.userWalletAddress,
        });
        if (walletAddressArray.length > 0) {
            throw new Error('Wallet address already exists');
        }
    }

    public routes(router: express.Router): void {
        // POST create
        router.post(
            '/signup',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    // Set data into database
                    const userData: UserData = {
                        userName: req.body.userName,
                        userPassword: req.body.userPassword,
                        userEmail: req.body.userEmail,
                        userWalletAddress: req.body.userWalletAddress,
                        userDeliveryAddress: req.body.userDeliveryAddress,
                        friends: {
                            sentRequests: [],
                            pending: [],
                            confirmed: [],
                        },
                    };
                    // Check if userName (unique), wallet address have been used before
                    await this.checkForDuplicateAttribute(userData);
                    // No repeats, proceed to insert
                    await this.collection.insertOne(userData);
                    let returnData = await this.searchDatabase({
                        userName: req.body.userName,
                        userPassword: req.body.userPassword,
                        userEmail: req.body.userEmail,
                        userWalletAddress: req.body.userWalletAddress,
                    });
                    res.send({
                        isOk: true,
                        userProfile: returnData,
                        message: 'Sign up successful',
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
            '/signin',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    const userId = req.body.userId;
                    const userPassword = req.body.userPassword;
                    // Retrieve details from database
                    let userDetails = await this.searchDatabase({
                        userName: userId,
                    });
                    // Check if user exists, if not use email
                    if (userDetails.length === 0) {
                        console.log('Cannot find username, searching email');
                        userDetails = await this.searchDatabase({
                            userEmail: userId,
                        });
                        if (userDetails.length === 0) {
                            throw new Error('User not found');
                        }
                    }
                    // Check if password is correct
                    if (userPassword === userDetails[0].userPassword) {
                        res.send({
                            loginOk: true,
                            userProfile: userDetails[0],
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
