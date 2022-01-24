import { MongoClient } from 'mongodb';
import { ethers } from 'ethers';
import Supplier from '../../ethereum/artifacts/contracts/Supplier.sol/Supplier.json';
import { RestaurantData } from './restaurantApi';
import DateTimeParser from './dateTimeParser';

const uri =
    'mongodb+srv://MinistryOfMetaMask:eF28WeXha7n3Y8DV@cluster0.6i8am.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export default class RestaurantHandler {
    collection: any;
    provider: ethers.providers.JsonRpcProvider;
    boosterContract: ethers.Contract;
    dateTimeParser: DateTimeParser;

    constructor() {
        this.dateTimeParser = new DateTimeParser();
        client.connect((err) => {
            this.collection = client.db('NomNom').collection('Restaurants');
        });
        const rinkebyUrl =
            'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
        this.provider = new ethers.providers.JsonRpcProvider(rinkebyUrl);
        const boosterContractAddress =
            '0x0CfB757D1dc2B016Fb7F3de604CBB7bB7b0B621D';
        this.boosterContract = new ethers.Contract(
            boosterContractAddress,
            Supplier.abi,
            this.provider
        );
        // Listen to contract for booster redemption
        this.boosterContract.on(
            'EventRedeemBooster',
            async (user, boosterName, date, tokenID) => {
                // May need to parse to interger
                console.log('Boost event emitted');
                const boosterTier = parseInt(boosterName);
                await this.applyBooster(user, date, boosterTier);
            }
        );
    }

    public async searchDatabase(searchItem: any) {
        const searchResult = await this.collection.find(searchItem);
        const array = await searchResult.toArray();
        return array;
    }

    // Returns entire database of restaurants
    async getDatabase() {
        const searchResult = await this.collection.find();
        const array = await searchResult.toArray();
        return array;
    }

    public async applyBooster(
        walletAddress: string,
        boostStartTime: any,
        boostTier: number
    ) {
        console.log(`Searching for: ${walletAddress}`);
        const restaurantData = await this.searchDatabase({
            restaurantWalletAddress: walletAddress.toLowerCase(),
        });
        const startDateTimeString =
            this.dateTimeParser.convertTimeFromUnix(boostStartTime);

        const startDateTime = new Date(startDateTimeString);
        // Boost duration in days
        let boostDuration = 0;
        switch (boostTier) {
            case 1:
                boostDuration = 7;
                break;
            case 2:
                boostDuration = 14;
                break;
            case 3:
                boostDuration = 31;
                break;
            default:
                boostDuration = 0;
        }
        const boostEndDate = new Date();
        boostEndDate.setDate(startDateTime.getDate() + boostDuration);

        // Update restaurant data
        let restaurantBoostData = restaurantData[0].restaurantBooster;
        restaurantBoostData.isBoosted = true;
        restaurantBoostData.boostTier = boostTier;
        restaurantBoostData.boostExpiry = JSON.stringify(boostEndDate);

        console.log(restaurantBoostData);

        await this.collection.updateOne(
            {
                restaurantWalletAddress: walletAddress.toLowerCase(),
            },
            {
                $set: { restaurantBooster: restaurantBoostData },
            }
        );
        console.log('RESTAURANT BOOSTED');
    }

    checkIsBoosterValid(restaurantData: RestaurantData, currentDate: Date) {
        const expiryDate = new Date(
            JSON.parse(restaurantData.restaurantBooster.boostExpiry)
        );
        return expiryDate > currentDate ? true : false;
    }

    async removeBoosterEffect(restaurantData: RestaurantData) {
        let boosterData = restaurantData.restaurantBooster;
        boosterData.isBoosted = false;
        boosterData.boostTier = 0;
        boosterData.boostExpiry = '';

        await this.collection.updateOne(
            {
                restaurantName: restaurantData.restaurantName,
                restaurantWalletAddress:
                    restaurantData.restaurantWalletAddress.toLowerCase(),
            },
            {
                $set: { restaurantBooster: boosterData },
            }
        );
    }

    // Sort restaurants according to tiers and update boost effects
    async sortAndUpdateRestaurants() {
        let returnData: any = {
            data: [],
            3: [],
            2: [],
            1: [],
            0: [],
        };
        const restaurants: RestaurantData[] = await this.getDatabase();
        returnData.data = restaurants;

        const currentDateString = this.dateTimeParser.getCurrentDateTime();
        const currentDate = new Date(currentDateString);
        for (let restaurant of restaurants) {
            // If booster exists and is boosted
            if (
                restaurant.hasOwnProperty('restaurantBooster') &&
                restaurant.restaurantBooster.isBoosted
            ) {
                // Check if booster is still valid
                const isValid = this.checkIsBoosterValid(
                    restaurant,
                    currentDate
                );
                if (isValid) {
                    returnData[
                        restaurant.restaurantBooster.boostTier.toString()
                    ].push(restaurant);
                    continue; // Skip to next restaurant
                } else if (!isValid) {
                    // Update restaurant booster
                    await this.removeBoosterEffect(restaurant);
                }
            }
            // Else just push into tier 0
            returnData[0].push(restaurant);
        }
        console.log(`Total data length: ${restaurants.length}`);
        console.log(`Number of tier 3: ${returnData[3].length}`);
        console.log(`Number of tier 2: ${returnData[2].length}`);
        console.log(`Number of tier 1: ${returnData[1].length}`);
        console.log(`Number of tier 0: ${returnData[0].length}`);
        return returnData;
    }
}
