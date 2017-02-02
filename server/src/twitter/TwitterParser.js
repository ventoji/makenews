import DateUtil from "../util/DateUtil";
export default class TwitterParser {
    static instance() {
        return new TwitterParser();
    }

    parseHandle(handles) {
        return handles.map(handle => {
            return {
                "id": handle.id_str,
                "picture": {
                    "data": {
                        "url": handle.profile_image_url_https
                    }
                },
                "name": handle.name
            };
        });
    }

    parseTweets(sourceId, tweets = []) {
        return tweets.map(tweet => { //eslint-disable-line consistent-return
            try {
                return this.parseTweet(sourceId, tweet);
            } catch(error) {
                //no handling
            }
        });
    }

    parseTweet(sourceId, tweet) {
        let feedObj = {
            "_id": tweet.id_str,
            "docType": "feed",
            "sourceType": "twitter",
            "description": "",
            "title": tweet.text,
            "link": "https://twitter.com/" + sourceId + "/status/" + tweet.id_str,
            "pubDate": tweet.created_at ? DateUtil.getUTCDateAndTime(tweet.created_at) : null,
            "tags": this.hashTags(tweet),
            "images": [],
            "videos": [],
            "sourceId": sourceId
        };
        let images = tweet.entities.media;
        if(images) { // eslint-disable-line no-magic-numbers
            images.forEach(item => {
                feedObj.images.push({ "url": item.media_url_https, "thumbnail": `${item.media_url_https}:thumb` });
            });
        }

        let videos = tweet.extended_entities ? tweet.extended_entities.media : [];
        videos.forEach(item => {
            feedObj.videos.push({ "thumbnail": `${item.media_url_https}:thumb` });
        });
        return feedObj;
    }

    hashTags(tweet) {
        let tagsArray = [];
        tweet.entities.hashtags.forEach(tag => {
            tagsArray.push(tag.text);
        });
        return tagsArray;
    }
}
