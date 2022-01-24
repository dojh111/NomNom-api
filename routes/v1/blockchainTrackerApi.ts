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
                    // const data = await this.formatAndAddNames(
                    //     logArray,
                    //     userAddress
                    // );
                    res.send({
                        count: buyCount,
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

        // router.get(
        //     '/nomnombalance/:walletAddress',
        //     async (req: Request, res: Response) => {
        //         try {
        //             let totalCount = 0;
        //             let data = {
        //                 buyCount: '',
        //                 sentCount: '',
        //                 receivedCount: '',
        //                 redeemedCount: '',
        //             };
        //             // Total Bought
        //             const startBlock = 0;
        //             const endBlock = await this.provider.getBlockNumber();
        //             const userAddress = req.params.walletAddress;
        //             // Create filter for event
        //             const dataFilterBuy =
        //                 this.marketContract.filters.EventBoughtFood(
        //                     userAddress
        //                 );
        //             const buyLogs = await this.marketContract.queryFilter(
        //                 dataFilterBuy,
        //                 startBlock,
        //                 endBlock
        //             );
        //             const buyLogArray = [...buyLogs];
        //             const buyCount = buyLogArray.length;
        //             console.log(`BOUGHT: ${buyCount}`);

        //             // Total gifts received
        //             const dataFilterGift =
        //                 this.marketContract.filters.EventGiftFood(
        //                     null,
        //                     userAddress
        //                 );
        //             const giftLogs = await this.marketContract.queryFilter(
        //                 dataFilterGift,
        //                 startBlock,
        //                 endBlock
        //             );
        //             const giftLogArray = [...giftLogs];
        //             const receivedCount = giftLogArray.length;
        //             console.log(`RECEIVED: ${receivedCount}`);

        //             // Total sent gifts
        //             const dataFilterSentGifts =
        //                 this.marketContract.filters.EventGiftFood(userAddress);
        //             const sentLogs = await this.marketContract.queryFilter(
        //                 dataFilterSentGifts,
        //                 startBlock,
        //                 endBlock
        //             );
        //             const sentLogArray = [...sentLogs];
        //             const sentCount = sentLogArray.length;
        //             console.log(`GIFTED: ${sentCount}`);

        //             // Total redeemed foods
        //             const dataFilterRedeem =
        //                 this.marketContract.filters.EventRedeemFood(
        //                     userAddress
        //                 );
        //             const redeemLogs = await this.marketContract.queryFilter(
        //                 dataFilterRedeem,
        //                 startBlock,
        //                 endBlock
        //             );
        //             const redeemLogArray = [...redeemLogs];
        //             const redeemedCount = redeemLogArray.length;
        //             console.log(`REDEEMED: ${redeemedCount}`);

        //             totalCount =
        //                 buyCount + receivedCount - sentCount - redeemedCount;
        //             console.log(`FINAL BALANCE: ${totalCount}`);

        //             res.send({
        //                 count: totalCount,
        //                 message: 'Success',
        //             }).status(200);
        //         } catch (err: any) {
        //             console.log(err.message);
        //             res.send({
        //                 count: 0,
        //                 message: err.message,
        //             }).status(500);
        //         }
        //     }
        // );

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
                    let tier = 'BRONZE';

                    for (let log of logArray) {
                        if (log.hasOwnProperty('args') && log.args) {
                            if (log.args.restaurantName == restaurantName) {
                                count++;
                            }
                        }
                    }

                    if (count >= 10 && count < 20) {
                        tier = 'SILVER';
                    } else if (count >= 20) {
                        tier = 'GOLD';
                    }

                    res.send({
                        tier: tier,
                        message: 'Success',
                    }).status(200);
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        tier: 'BRONZE',
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
            '/redeemedfood/:walletAddress',
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

                    // const data = await this.formatAndAddNames(
                    //     logArray,
                    //     userAddress
                    // );
                    console.log(`Total redeem count: ${receivedCount}`);
                    res.send({
                        count: receivedCount,
                        // data: data,
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
            '/nomnombalance/:walletAddress',
            async (req: Request, res: Response) => {
                try {
                    let totalCount = 0;
                    let data = [];
                    // Total Bought
                    const startBlock = 0;
                    const endBlock = await this.provider.getBlockNumber();
                    const userAddress = req.params.walletAddress;

                    // Total food bought
                    const dataFilterBuy =
                        this.marketContract.filters.EventBoughtFood(
                            userAddress
                        );
                    data.push(
                        this.marketContract.queryFilter(
                            dataFilterBuy,
                            startBlock,
                            endBlock
                        )
                    );
                    // Total gifts received
                    const dataFilterGift =
                        this.marketContract.filters.EventGiftFood(
                            null,
                            userAddress
                        );
                    data.push(
                        this.marketContract.queryFilter(
                            dataFilterGift,
                            startBlock,
                            endBlock
                        )
                    );
                    // Total redeemed foods
                    const dataFilterRedeem =
                        this.marketContract.filters.EventRedeemFood(
                            userAddress
                        );
                    data.push(
                        this.marketContract.queryFilter(
                            dataFilterRedeem,
                            startBlock,
                            endBlock
                        )
                    );

                    const result = await Promise.all(data);
                    let boughtCount = 0;
                    let receivedCount = 0;
                    let sentCount = 0;
                    let redeemedCount = 0;

                    // Total sent gifts
                    const dataFilterSentGifts =
                        this.marketContract.filters.EventGiftFood(userAddress);
                    const logs = await this.marketContract.queryFilter(
                        dataFilterSentGifts,
                        startBlock,
                        endBlock
                    );
                    const logArray = [...logs];
                    sentCount = logArray.length;

                    for (let data of result) {
                        if (data[0] && data[0].event) {
                            let eventType = '';
                            let count = 0;
                            eventType = data[0].event;
                            count = data.length;
                            switch (eventType) {
                                case 'EventBoughtFood':
                                    boughtCount = count;
                                    break;
                                case 'EventRedeemFood':
                                    redeemedCount = count;
                                    break;
                                case 'EventGiftFood':
                                    receivedCount = count;
                                    break;
                            }
                        }
                    }

                    console.log(`BOUGHT: ${boughtCount}`);
                    console.log(`RECEIVED: ${receivedCount}`);
                    console.log(`SENT: ${sentCount}`);
                    console.log(`REDEEMED: ${redeemedCount}`);
                    totalCount =
                        boughtCount + receivedCount - sentCount - redeemedCount;
                    console.log(`FINAL BALANCE: ${totalCount}`);

                    res.send({
                        count: totalCount,
                        message: 'Success',
                    }).status(200);
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        count: 0,
                        message: err.message,
                    }).status(500);
                }
            }
        );
    }
}
