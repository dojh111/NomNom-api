import { ethers } from 'ethers';
import Market from '../../ethereum/artifacts/contracts/Market.sol/Market.json';
import { MongoClient, ObjectId } from 'mongodb';
import DateTimeParser from './dateTimeParser';

const uri =
    'mongodb+srv://MinistryOfMetaMask:eF28WeXha7n3Y8DV@cluster0.6i8am.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export default class BlockchainTracker {
    marketContract: ethers.Contract;
    provider: ethers.providers.JsonRpcProvider;
    collection: any;
    dateTimeParser: DateTimeParser;

    constructor() {
        const rinkebyUrl =
            'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
        this.provider = new ethers.providers.JsonRpcProvider(rinkebyUrl);
        // Create Contract
        const marketContractAddress =
            '0x8EaEc1C60a12Fe4ff231576DaaD9371BA8b09DA5';
        this.marketContract = new ethers.Contract(
            marketContractAddress,
            Market.abi,
            this.provider
        );
        this.dateTimeParser = new DateTimeParser();
        client.connect((err) => {
            this.collection = client.db('NomNom').collection('Food');
        });
    }

    public async searchDatabase(searchItem: any) {
        const searchResult = await this.collection.find(searchItem);
        const array = await searchResult.toArray();
        return array;
    }

    public async getFoodDetails(foodID: any) {
        const foodDetails = await this.searchDatabase({
            _id: new ObjectId(foodID),
        });
        if (!foodDetails) {
            throw new Error(`Task ${foodID} is not found!`);
        }
        return foodDetails[0];
    }

    public async addFoodNames(logs: any[], userAddress: string) {
        const formattedLogs: any = [];
        return Promise.all(
            logs.map(async (event) => {
                if (event.hasOwnProperty('args') && event.args) {
                    const foodDetails = await this.getFoodDetails(
                        event.args.foodID
                    );
                    const userProfile = await this.searchDatabase({
                        userWalletAddress: userAddress,
                    });
                    const logData = {
                        sender: userProfile[0].userName,
                        foodName: foodDetails.foodName,
                        foodImageUrl: foodDetails.foodImageUrl,
                        restaurantName: foodDetails.restaurantName,
                        date: this.dateTimeParser.convertTimeFromUnix(
                            event.args.date
                        ),
                        tokenID: event.args.tokenId,
                    };
                    formattedLogs.unshift(logData);
                }
            })
        ).then(() => {
            console.log(formattedLogs);
            return formattedLogs;
        });
    }

    public async formatAndAddNames(logs: any[], userAddress: string) {
        const formattedLogs: any = [];
        return Promise.all(
            logs.map(async (event) => {
                if (event.hasOwnProperty('args') && event.args) {
                    const foodDetails = await this.getFoodDetails(
                        event.args.foodID
                    );
                    const logData = {
                        sender: userAddress,
                        foodName: foodDetails.foodName,
                        foodImageUrl: foodDetails.foodImageUrl,
                        restaurantName: foodDetails.restaurantName,
                        date: this.dateTimeParser.convertTimeFromUnix(
                            event.args.date
                        ),
                        tokenID: event.args.tokenId.toString(),
                    };
                    formattedLogs.unshift(logData);
                }
            })
        ).then(() => {
            console.log(formattedLogs);
            return formattedLogs;
        });
    }
}
