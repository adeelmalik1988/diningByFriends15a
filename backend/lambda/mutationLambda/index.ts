import { PersonInput, RestaurantInput, ReviewInput, ReviewRatingInput, FriendRequestInput } from "./MutationTypes"
import createPerson from "./createPerson";
import createRestaurant from "./createRestaurant";
import createReview from "./createReview"
import sendFriendRequest from "./sendFriendRequest";
import acceptFriendRequest from "./acceptFriendRequest";
import createReviewRating from "./createReviewRating"
import createCuisine from "./createCuisine"
import createCity from "./createCity"
import createState from "./createState"


type AppsyncEvent = {
    info: {
        fieldName: string
    },

    arguments: {
        personDetail: PersonInput
        restaurantDetail: RestaurantInput
        reviewDetail: ReviewInput
        reviewRatingDetail: ReviewRatingInput
        myIdAndFriendId: FriendRequestInput

    }

}




exports.handler = async (event: any) => {

    console.log("received event:", event),
        console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    console.log("EVENT Details: \n" + JSON.stringify(event.detail));

    const eventDetail = event.detail
    console.log("EventDetail variable", eventDetail)
    const eventKeys = Object.keys(event)
    const eventType: string = event[eventKeys[2]]
    console.log("Object keys", Object.keys(event))
    console.log("detail-type", event[eventKeys[2]])



    switch (eventType) {
        case "createPerson":
            return await createPerson(eventDetail);
        case "createRestaurant":
            return await createRestaurant(eventDetail);
        case "createReview":
            return await createReview(eventDetail);
        case "createReviewRating":
            return await createReviewRating(eventDetail);
        case "createCuisine":
            return await createCuisine(eventDetail);
        case "createCity":
            return await createCity(eventDetail);
        case "createState":
            return await createState(eventDetail);
        case "sendFriendRequest":
            return await sendFriendRequest(eventDetail);
        case "acceptFriendRequest":
            return await acceptFriendRequest(eventDetail);
        default:
            return null;

    }

}