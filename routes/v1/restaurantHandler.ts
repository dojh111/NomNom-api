import { MongoClient } from 'mongodb';
import { ethers } from 'ethers';
import Market from '../../ethereum/Market.sol/Market.json';
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
        // Create Contract - TO UPDATE TO NEWEST CONTRACT
        const boosterContractAddress =
            '0xE5B885Cb0d8dBF8B69f33CcB3BC4774a47eCd2e7';
        this.boosterContract = new ethers.Contract(
            boosterContractAddress,
            Market.abi,
            this.provider
        );
        // TO UPDATE TO CORRECT EVENT NAME AND PARAMS
        this.boosterContract.on(
            'EventBoughtFood',
            async (user, foodID, date, tokenId) => {
                // May need to parse to interger
                console.log('Boost event emitted');
                await this.applyBooster(user, date, tokenId);
            }
        );
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
        return array;
    }

    async applyBooster(
        restaurantWalletAddress: string,
        boostStartTime: any,
        boostTier: number
    ) {
        const restaurantData: RestaurantData[] = await this.searchDatabase({
            restaurantWalletAddress: restaurantWalletAddress,
        });
        const startDateTimeString =
            this.dateTimeParser.convertTimeFromUnix(boostStartTime);

        const startDateTime = new Date(startDateTimeString);
        // console.log('START TIME:');
        // console.log(startDateTimeString);
        // console.log(startDateTime);

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

        await this.collection.updateOne(
            {
                restaurantWalletAddress: restaurantWalletAddress,
            },
            {
                $set: { restaurantBooster: restaurantBoostData },
            }
        );

        // console.log('END DATE:');
        // console.log(boostEndDate);
        // const stringified = JSON.stringify(boostEndDate);
        // console.log(stringified);
        // const parsedStringified = new Date(JSON.parse(stringified));

        // if (startDateTime <= parsedStringified) {
        //     console.log('STARTDATE <= END DATE');
        // } else if (startDateTime > parsedStringified) {
        //     console.log('STARTDATE > END DATE');
        // }
    }
}
