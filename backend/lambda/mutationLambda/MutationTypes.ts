export type PersonInput = {
    firstName: string
    lastName: string
    email: string
    cityId: string

}

export type RestaurantInput = {
    name: String
    address: string
    cityId: String
    stateId: String
    cuisineId: String

}

export type ReviewInput = {
    rating: number
    body: String
    aboutRestaurant: String
    myId: String
}

export type ReviewRatingInput = {
    rating: number
    aboutReview: string
    myId: string
}

export type FriendRequestInput = {
    myId: string
    friendId: string
}

export type CityInput = {
    cityName: string
    stateId: string
}

export enum FriendRequestStatus {
REQUESTED = "requested" ,
CONFIRMED = "confirmed"
}

export enum Vertics {
    PERSON = "person",
    RESTAURANT = "restaurant",
    REVIEW = "review",
    REVIEW_RATING = "review_rating",
    CITY = "city",
    STATE = "state",
    CUISINE = "cuisine"
}

export enum VerticsPersonLabel {
    PERSON_ID = "person_id",
    FIRST_NAME = "first_name",
    LAST_NAME = "last_name",
    EMAIL = "email"
}

export enum VerticsRestaurantLabel {
    RESTAURANT_ID = "restaurant_id",
    RESTAURANT_NAME = "restaurant_name",
    ADDRESS = "address"

}

export enum VerticsReviewLabel {
    REVIEW_ID = "review_id",
    RATING = "rating",
    BODY = "body",
    CREATED_DATE = "created_date"
}

export enum VerticsReviewRatingLabel {
    REVIEW_RATING_ID = "review_rating_id",
    RATING = "rating",
    REVIEW_DATE = "review_date"
}

export enum VerticsCityLabel {
    CITY_ID = "city_id",
    NAME = "name"
}

export enum VerticsStateLabel {
    STATE_ID = "state_id",
    NAME = "name"
}

export enum VerticsCuisineLabel {
    CUISINE_ID = "cuisine_id",
    CUISINE_NAME = "cuisine_name"
}

export enum Edges {
    FRIENDSHIP = "friendship",
    WROTE = "wrote",
    ABOUT = "about",
    LIVES = "lives",
    SERVES = "serves",
    WITHIN = "within"
}

export enum EdgeFriendshipLabel {
    STATUS = "status"

}


export enum MutationActions {
    REVIEW_CREATED = "REVIEW_CREATED",
    REVIEW_RATING_CREATED = "REVIEW_RATING_CREATED",
    PERSON_ADDED = "PERSON_ADDED",
    RESTAURANT_ADDED = "RESTAURANT_ADDED"
}
    
