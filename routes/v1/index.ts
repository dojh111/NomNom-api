// Logic
import * as express from 'express';

let router = express.Router();

// Controller/Routes Managers.
import HealthChecker from './health-checker';
import UserActions from './userActions';
import SupplierActions from './supplierActions';
import BlockchainTrackerApi from './blockchainTrackerApi';
import Food from './food';
import RestaurantApi from './restaurantApi';
import FriendsHandlerApi from './friendsHandler.api';
import ExchangeRateApi from './exchangeRateApi';

// Creating new Routes Instances.
const healthRoute: HealthChecker = new HealthChecker();
const userActionsRoute: UserActions = new UserActions();
const supplierActionsRoute: SupplierActions = new SupplierActions();
const blockchainTrackerApiRoute: BlockchainTrackerApi =
    new BlockchainTrackerApi();
const foodRoute: Food = new Food();
const restaurantApiRoute: RestaurantApi = new RestaurantApi();
const friendsHandlerApiRoute: FriendsHandlerApi = new FriendsHandlerApi();
const exchangeRateApiRoute: ExchangeRateApi = new ExchangeRateApi();

// Registering our Routes.
healthRoute.routes(router);
userActionsRoute.routes(router);
supplierActionsRoute.routes(router);
blockchainTrackerApiRoute.routes(router);
foodRoute.routes(router);
restaurantApiRoute.routes(router);
friendsHandlerApiRoute.routes(router);
exchangeRateApiRoute.routes(router);

export default router;
