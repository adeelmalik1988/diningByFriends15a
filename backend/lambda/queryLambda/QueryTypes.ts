export type XRelatedToYInput = {
    xId: string,
    yId: string

}

export type RestaurantHighestRatedNearMeCuisineSpecificInput = {
    myId: string,
    cuisine: string
}

export type RestaurantsMyFreindsReviewedRatedPastXDaysInput = {
    myId: string
    pastDays: number
}

export enum RestaurantReturn {
    id = "id",
    name = "name",
    address = "address",
    city = "city",
    state = "state",
    rating = "rating",
    cuisine = "cuisine",
    label = "label"
}

export enum PersonReturn {
    id = "id",
    firstName = "firstName",
    lastName = "lastName",
    email = 'email',
    city = 'city',
    label = 'label'
}

export enum CityReturn {
    cityId = "cityId",
    cityName = "cityName",
    stateName = "stateName",
    label = "label"
}

export enum StateReturn {
    stateId = "stateId",
    stateName = "stateName",
    label = "label"
}

export enum CuisineReturn {
    cuisineId = "cuisineId",
    cuisineName = 'cuisineName',
    label = 'label'
}

export enum FreindRequestReturn {
    firstName = "firstName",
    lastName = "lastName",
    personId = "personId"
}

export enum GetRestaurantNewestReviewsReturn {
    label = 'label',
    reviewId = 'reviewId',
    rating = 'rating',
    createdDate = 'createdDate',
    body = 'body',
    createrId = 'createrId',
    createrFirstName = 'createrFirstName',
    createrLastName = 'createrLastName',
    reviewRatingDetail = 'reviewRatingDetail'
}

export enum getMyFriendsOfFriendsReturn {
    label = 'label',
    personId = 'personId',
    firstName = 'firstName',
    lastName = 'lastName',
    email = 'email',
    city = 'city'
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
    