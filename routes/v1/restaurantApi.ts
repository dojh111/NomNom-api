import * as express from 'express';
import { Request, Response } from 'express';
import multer from 'multer';
import RestaurantHandler from './restaurantHandler';
// import ObjectId from 'mongodb';

export type RestaurantData = {
    restaurantName: string;
    restaurantDescription: string;
    restaurantImageUrl: string;
    restaurantWalletAddress: string;
    restaurantBooster: {
        isBoosted: boolean;
        boostTier: number;
        boostExpiry: string;
    };
};

export default class RestaurantApi extends RestaurantHandler {
    constructor() {
        super();
    }

    public routes(router: express.Router): void {
        // POST create
        router.post(
            '/restaurants',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    // Set data into database
                    const restaurantData: RestaurantData = {
                        restaurantName: req.body.restaurantName,
                        restaurantDescription: req.body.restaurantDescription,
                        restaurantImageUrl: req.body.restaurantImageUrl,
                        restaurantWalletAddress:
                            req.body.restaurantWalletAddress,
                        restaurantBooster: {
                            isBoosted: false,
                            boostTier: 0,
                            boostExpiry: '',
                        },
                    };
                    this.collection.insertOne(restaurantData);
                    let returnData = await this.searchDatabase({
                        restaurantName: req.body.restaurantName,
                        restaurantDescription: req.body.restaurantDescription,
                        restaurantImageUrl: req.body.restaurantImageUrl,
                    });
                    res.send({
                        isOk: true,
                        restaurantData: returnData,
                        message: 'Restaurant listed',
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
            '/restaurants',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    // Retrieve details from database
                    // const restaurantDetails = await this.getDatabase();
                    const restaurantDetails =
                        await this.sortAndUpdateRestaurants();
                    console.log(restaurantDetails);
                    res.send(restaurantDetails);
                } catch (err: any) {
                    res.send({
                        message: err.message,
                    }).status(403);
                }
            }
        );
    }
}
