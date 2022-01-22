import { MongoClient } from 'mongodb';
import { UserData } from './userActions';

const uri =
    'mongodb+srv://MinistryOfMetaMask:eF28WeXha7n3Y8DV@cluster0.6i8am.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export default class FriendsHandler {
    collection: any;

    constructor() {
        client.connect((err) => {
            this.collection = client.db('NomNom').collection('Users');
        });
    }

    public async searchByUserName(searchTerm: string): Promise<UserData[]> {
        const searchResult = await this.collection.find({
            userName: searchTerm,
        });
        return await searchResult.toArray();
    }

    public async searchByEmail(searchTerm: string): Promise<UserData[]> {
        const searchResult = await this.collection.find({
            userEmail: searchTerm,
        });
        return await searchResult.toArray();
    }

    public async searchByWalletAddress(
        searchTerm: string
    ): Promise<UserData[]> {
        const searchResult = await this.collection.find({
            userWalletAddress: searchTerm,
        });
        return await searchResult.toArray();
    }

    public async searchMultipleFields(searchTerm: string): Promise<UserData[]> {
        let result = await this.searchByUserName(searchTerm);
        if (result[0]) return result;
        result = await this.searchByEmail(searchTerm);
        if (result[0]) return result;
        result = await this.searchByWalletAddress(searchTerm);
        if (result[0]) return result;
        throw new Error('No User Found');
    }

    public findElementWithUserName(userName: string, array: any[]) {
        for (let element of array) {
            if (userName === element.friendUserName) {
                return element;
            }
        }
    }

    public removeOldRequest(userName: any, requestArray: any) {
        const tempArray = requestArray;
        for (let i = 0; i < requestArray.length; i++) {
            if (requestArray[i].friendUserName === userName) {
                tempArray.splice(i, 1);
                break;
            }
        }
        return tempArray;
    }

    public async updateDatabaseCollection(
        userProfile: UserData,
        newFriendsList: any
    ) {
        await this.collection.updateOne(
            {
                userName: userProfile.userName,
                userWalletAddress: userProfile.userWalletAddress,
            },
            {
                $set: { friends: newFriendsList },
            }
        );
    }

    public checkForExistingRequests(
        senderProfile: Array<UserData>,
        receiverProfile: Array<UserData>
    ) {
        const senderFriendsList = senderProfile[0].friends;
        // User is already a friend
        for (let friend of senderFriendsList.confirmed) {
            if (friend.friendUserName === receiverProfile[0].userName) {
                console.log('Already friends');
                throw new Error('Already friends');
            }
        }
        // User already sent a request previously that has not been accepted
        if (receiverProfile[0].friends.pending.length > 0) {
            for (let request of receiverProfile[0].friends.pending) {
                if (request.friendUserName === senderProfile[0].userName) {
                    throw new Error('Friend request already sent previously');
                }
            }
        }
    }
}
