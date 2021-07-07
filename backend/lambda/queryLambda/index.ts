import { XRelatedToYInput, RestaurantHighestRatedNearMeCuisineSpecificInput, RestaurantsMyFreindsReviewedRatedPastXDaysInput } from "./QueryTypes"
import GetRestaurants from "./getRestaurants";
import GetPersons from "./getPersons";
import GetPersonById from "./getPersonById";
import GetFriends from "./getFriends";
import GetRestaurantNewestReviews from "./getRestaurantNewestReviews";
import GetMyFriendsOfFriends from "./getMyFriendsOfFriends";
import GetXRelatedToY from "./getXRelatedToY"
import GetRestaurantHighestRatedNearMeCuisineSpecific from "./getRestaurantHighestRatedNearMeCuisineSpecific"
import GetTenRestaurantsHighestRattedNearMe from "./getTenRestaurantsHighestRattedNearMe"
import GetRestaurantsMyFriendRecommend from "./getRestaurantsMyFriendRecommend"
import GetBestRestaurantsOnBasedMyFriendsRating from "./getBestRestaurantsOnBasedMyFriendsRating"
import GetRestaurantsMyFreindsReviewedRatedPastXDays from "./getRestaurantsMyFreindsReviewedRatedPastXDays"
import getCities from "./getCities";
import getStates from "./getStates";
import getCuisines from "./getCuisines";
import getFriendRequests from "./getFriendRequests";
import getReviewRatings from "./getReviewRatings";

type AppsyncEvent = {
    info: {
        fieldName: string
    },

    arguments: {
        personId: string
        myId: string
        RestaurantId: string
        xAndYIds: XRelatedToYInput
        myIdAndCuisine: RestaurantHighestRatedNearMeCuisineSpecificInput
        myIdAndPastDays: RestaurantsMyFreindsReviewedRatedPastXDaysInput
        reviewId: string

    }

}




exports.handler = async (event: AppsyncEvent) => {

    switch (event.info.fieldName) {
        case "getRestaurants":
            return await GetRestaurants();
        case "getPersons":
            return await GetPersons();
        case "getCities":
            return await getCities();
        case "getStates":
            return await getStates();
        case "getCuisines":
            return await getCuisines();
        case "getReviewRatings":
            return await getReviewRatings(event.arguments.reviewId);
        case "getPersonById":
            return await GetPersonById(event.arguments.personId);
        case "getFriendRequests":
            return await getFriendRequests(event.arguments.myId);
        case "getFriends":
            return await GetFriends(event.arguments.myId);
        case "getRestaurantNewestReviews":
            return await GetRestaurantNewestReviews(event.arguments.RestaurantId);
        case "getMyFriendsOfFriends":
            return await GetMyFriendsOfFriends(event.arguments.myId);
        case "getXRelatedToY":
            return await GetXRelatedToY(event.arguments.xAndYIds);
        case "getRestaurantHighestRatedNearMeCuisineSpecific":
            return await GetRestaurantHighestRatedNearMeCuisineSpecific(event.arguments.myIdAndCuisine);
        case "getTenRestaurantsHighestRattedNearMe":
            return await GetTenRestaurantsHighestRattedNearMe(event.arguments.myId);
        case "getRestaurantsMyFriendRecommend":
            return await GetRestaurantsMyFriendRecommend(event.arguments.myId);
        case "getBestRestaurantsOnBasedMyFriendsRating":
            return await GetBestRestaurantsOnBasedMyFriendsRating(event.arguments.myId);
        case "getRestaurantsMyFreindsReviewedRatedPastXDays":
            return await GetRestaurantsMyFreindsReviewedRatedPastXDays(event.arguments.myIdAndPastDays)
        default:
            return null;

    }

}