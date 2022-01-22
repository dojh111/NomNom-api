// Logic
import * as express from 'express';

let router = express.Router();

// Controller/Routes Managers.
import HealthChecker from './health-checker';
import UserActions from './userActions';
import BlockchainTrackerApi from './blockchainTrackerApi';
import Food from './food';
import Restaurant from './restaurant';
import FriendsHandlerApi from './friendsHandler.api';

// Creating new Routes Instances.
const healthRoute: HealthChecker = new HealthChecker();
const userActionsRoute: UserActions = new UserActions();
const blockchainTrackerApiRoute: BlockchainTrackerApi =
    new BlockchainTrackerApi();
const foodRoute: Food = new Food();
const restaurantRoute: Restaurant = new Restaurant();
const friendsHandlerApiRoute: FriendsHandlerApi = new FriendsHandlerApi();

// Registering our Routes.
healthRoute.routes(router);
userActionsRoute.routes(router);
blockchainTrackerApiRoute.routes(router);
foodRoute.routes(router);
restaurantRoute.routes(router);
friendsHandlerApiRoute.routes(router);

export default router;
