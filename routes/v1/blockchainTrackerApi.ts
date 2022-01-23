import * as express from 'express';
import { Request, Response } from 'express';
import BlockchainTracker from './blockchainTracker';

export default class BlockchainTrackerApi extends BlockchainTracker {
    constructor() {
        super();
    }

    public routes(router: express.Router): void {
        // Gets buy progress count
        router.get(
            '/buyprogress/:walletAddress',
            async (req: Request, res: Response) => {
                try {
                    const userAddress = req.params.walletAddress;
                    // Create filter for event
                    const dataFilter =
                        this.marketContract.filters.EventBoughtFood(
                            userAddress
                        );
                    const startBlock = 0;
                    const endBlock = await this.provider.getBlockNumber();
                    const logs = await this.marketContract.queryFilter(
                        dataFilter,
                        startBlock,
                        endBlock
                    );
                    const logArray = [...logs];
                    const buyCount = logArray.length;
                    const data = await this.formatAndAddNames(
                        logArray,
                        userAddress
                    );
                    // console.log('DATA HERE');
                    // console.log(data);
                    res.send({
                        count: buyCount,
                        data: data,
                        message: 'Success',
                    }).status(200);
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        count: 0,
                        data: '',
                        message: err.message,
                    }).status(500);
                }
            }
        );

        router.get(
            '/loyalty/:walletAddress/:restaurantName',
            async (req: Request, res: Response) => {
                try {
                    const walletAddress = req.params.walletAddress;
                    const restaurantName = req.params.restaurantName;
                    const dataFilter =
                        this.marketContract.filters.EventBoughtFood(
                            walletAddress
                        );
                    const startBlock = 0;
                    const endBlock = await this.provider.getBlockNumber();
                    const logs = await this.marketContract.queryFilter(
                        dataFilter,
                        startBlock,
                        endBlock
                    );
                    const logArray = [...logs];
                    let count = 0;
                    let tier = 'bronze';

                    for (let log of logArray) {
                        if (log.hasOwnProperty('args') && log.args) {
                            if (log.args.restaurantName == restaurantName) {
                                count++;
                            }
                        }
                    }

                    if (count >= 10 && count < 20) {
                        tier = 'silver';
                    } else if (count >= 20) {
                        tier = 'gold';
                    }

                    res.send({
                        tier: tier,
                        message: 'Success',
                    }).status(200);
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        tier: 'bronze',
                        message: err.message,
                    }).status(500);
                }
            }
        );

        router.get(
            '/receivedgifts/:walletAddress',
            async (req: Request, res: Response) => {
                try {
                    const userAddress = req.params.walletAddress;
                    // Create filter for event
                    const dataFilter =
                        this.marketContract.filters.EventGiftFood(
                            null,
                            userAddress
                        );
                    const startBlock = 0;
                    const endBlock = await this.provider.getBlockNumber();
                    const logs = await this.marketContract.queryFilter(
                        dataFilter,
                        startBlock,
                        endBlock
                    );
                    const logArray = [...logs];
                    const receivedCount = logArray.length;

                    //const data = await this.addFoodNames(logArray, userAddress);
                    res.send({
                        count: receivedCount,
                        data: '',
                        message: 'Success',
                    }).status(200);
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        count: 0,
                        data: '',
                        message: err.message,
                    }).status(500);
                }
            }
        );

        router.get(
            '/sentgifts/:walletAddress',
            async (req: Request, res: Response) => {
                try {
                    const userAddress = req.params.walletAddress;
                    // Create filter for event
                    const dataFilter =
                        this.marketContract.filters.EventGiftFood(userAddress);
                    const startBlock = 0;
                    const endBlock = await this.provider.getBlockNumber();
                    const logs = await this.marketContract.queryFilter(
                        dataFilter,
                        startBlock,
                        endBlock
                    );
                    const logArray = [...logs];
                    const receivedCount = logArray.length;

                    //const data = await this.addFoodNames(logArray, userAddress);
                    res.send({
                        count: receivedCount,
                        data: '',
                        message: 'Success',
                    }).status(200);
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        count: 0,
                        data: '',
                        message: err.message,
                    }).status(500);
                }
            }
        );

        router.get(
            '/redeemedgifts/:walletAddress',
            async (req: Request, res: Response) => {
                try {
                    const userAddress = req.params.walletAddress;
                    // Create filter for event
                    const dataFilter =
                        this.marketContract.filters.EventRedeemFood(
                            userAddress
                        );
                    const startBlock = 0;
                    const endBlock = await this.provider.getBlockNumber();
                    const logs = await this.marketContract.queryFilter(
                        dataFilter,
                        startBlock,
                        endBlock
                    );
                    const logArray = [...logs];
                    const receivedCount = logArray.length;

                    const data = await this.formatAndAddNames(
                        logArray,
                        userAddress
                    );
                    console.log(`Total redeem count: ${receivedCount}`);
                    res.send({
                        count: receivedCount,
                        data: data,
                        message: 'Success',
                    }).status(200);
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        count: 0,
                        data: '',
                        message: err.message,
                    }).status(500);
                }
            }
        );
    }
}
