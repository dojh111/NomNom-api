import * as express from 'express';
import { Request, Response } from 'express';
import multer from 'multer';
import FriendsHandler from './friendsHandler';
import { UserData } from './userActions';

export type FriendObject = {
    friendUserName: string;
    friendWalletAddress: string;
    friendEmail: string;
};

export default class FriendsHandlerApi extends FriendsHandler {
    collection: any;

    constructor() {
        super();
    }

    public routes(router: express.Router): void {
        router.post(
            '/friendrequest',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    // Use username for sender
                    const senderId = req.body.userId;
                    const senderProfile: Array<UserData> =
                        await this.searchByUserName(senderId);
                    if (!senderProfile[0]) {
                        throw new Error('Cannot find user profile');
                    }
                    // Check all 3 fields
                    const receiverId = req.body.receiver;
                    const receiverProfile: Array<UserData> =
                        await this.searchMultipleFields(receiverId);
                    // Check if already friends
                    this.checkForExistingRequests(
                        senderProfile,
                        receiverProfile
                    );
                    // Update to pending of receiver
                    const addFriendRequest: FriendObject = {
                        friendUserName: senderProfile[0].userName,
                        friendWalletAddress: senderProfile[0].userWalletAddress,
                        friendEmail: senderProfile[0].userEmail,
                    };
                    const newPendingList = receiverProfile[0].friends;
                    newPendingList.pending.push(addFriendRequest);
                    await this.updateDatabaseCollection(
                        receiverProfile[0],
                        newPendingList
                    );
                    // Update to sentRequests of initator of request
                    const sentFriendRequest: FriendObject = {
                        friendUserName: receiverProfile[0].userName,
                        friendWalletAddress:
                            receiverProfile[0].userWalletAddress,
                        friendEmail: receiverProfile[0].userEmail,
                    };
                    const newSentRequestList = senderProfile[0].friends;
                    newSentRequestList.sentRequests.push(sentFriendRequest);
                    await this.updateDatabaseCollection(
                        senderProfile[0],
                        newSentRequestList
                    );
                    res.send({
                        isOk: true,
                        message: 'Friend request sent',
                    }).status(200);
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        isOk: false,
                        message: `Request failed: ${err.message}`,
                    }).status(500);
                }
            }
        );

        router.post(
            '/friendrequest/response',
            multer().none(),
            async (req: Request, res: Response) => {
                try {
                    // Request sent from other person
                    const senderUserName = req.body.senderUserName;
                    // Receiver user profile - Guy accepting
                    const receiverUserName = req.body.receiverUserName;
                    let isAccepted = req.body.isAccepted;
                    if (typeof isAccepted != 'boolean') {
                        console.log('Not boolean type');
                        isAccepted = isAccepted == 'true' ? true : false;
                    }

                    const requestSender = await this.searchByUserName(
                        senderUserName
                    );
                    const requestReceiver = await this.searchByUserName(
                        receiverUserName
                    );

                    if (isAccepted) {
                        // Move friend request for receiver from pending to confirmed - For receiver
                        // Move friend request from sent request to confirmed - For initiator
                        const senderNewFriendsList = requestSender[0].friends;
                        // For senderNewFriendsList, remove from sentRequests, add into confirmed friends
                        let newFriend = this.findElementWithUserName(
                            requestReceiver[0].userName,
                            senderNewFriendsList.sentRequests
                        );
                        // Add into confirmed friends
                        senderNewFriendsList.confirmed.push(newFriend);
                        senderNewFriendsList.sentRequests =
                            this.removeOldRequest(
                                newFriend.friendUserName,
                                senderNewFriendsList.sentRequests
                            );
                        await this.updateDatabaseCollection(
                            requestSender[0],
                            senderNewFriendsList
                        );
                        const receiverNewFriendsList =
                            requestReceiver[0].friends;
                        // For receiverNewFriendsList, remove from pending, add into confirmed friends
                        newFriend = this.findElementWithUserName(
                            requestSender[0].userName,
                            receiverNewFriendsList.pending
                        );
                        // Add into confirmed friends
                        receiverNewFriendsList.confirmed.push(newFriend);
                        receiverNewFriendsList.pending = this.removeOldRequest(
                            newFriend.friendUserName,
                            receiverNewFriendsList.pending
                        );
                        await this.updateDatabaseCollection(
                            requestReceiver[0],
                            receiverNewFriendsList
                        );
                    } else if (isAccepted === false) {
                        // Remove requests from both
                        const senderNewFriendsList = requestSender[0].friends;
                        senderNewFriendsList.sentRequests =
                            this.removeOldRequest(
                                requestReceiver[0].userName,
                                senderNewFriendsList.sentRequests
                            );
                        await this.updateDatabaseCollection(
                            requestSender[0],
                            senderNewFriendsList
                        );
                        const receiverNewFriendsList =
                            requestReceiver[0].friends;
                        receiverNewFriendsList.pending = this.removeOldRequest(
                            requestSender[0].userName,
                            receiverNewFriendsList.pending
                        );
                        console.log(receiverNewFriendsList);
                        await this.updateDatabaseCollection(
                            requestReceiver[0],
                            receiverNewFriendsList
                        );
                        console.log('Successfully removed requests');
                    }

                    res.send({
                        isOk: true,
                        message: 'Updated friend status',
                    }).status(200);
                } catch (err: any) {
                    console.log(err.message);
                    res.send({
                        isOk: false,
                        message: `Request failed: ${err.message}`,
                    }).status(500);
                }
            }
        );
    }
}
