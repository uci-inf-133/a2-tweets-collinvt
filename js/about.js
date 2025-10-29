let tweet_array = [];

function parseTweets(runkeeper_tweets) {
    // Don't proceed if no tweets loaded
    if(runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }
    
    tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });
    
    // Update number of tweets
    document.getElementById('numberTweets').innerText = tweet_array.length;
    
    // Find earliest and latest tweets
    let earliest = tweet_array[0];
    let latest = tweet_array[0];
    
    for(let tweet of tweet_array) {
        if(tweet.time < earliest.time) {
            earliest = tweet;
        }
        if(tweet.time > latest.time) {
            latest = tweet;
        }
    }
    
    // Format dates
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('firstDate').innerText = earliest.time.toLocaleDateString('en-US', options);
    document.getElementById('lastDate').innerText = latest.time.toLocaleDateString('en-US', options);
    
    // Count tweet categories
    let completedCount = 0;
    let liveCount = 0;
    let achievementCount = 0;
    let miscCount = 0;
    
    for(let tweet of tweet_array) {
        switch(tweet.source) {
            case 'completed':
                completedCount++;
                break;
            case 'live':
                liveCount++;
                break;
            case 'achievement':
                achievementCount++;
                break;
            case 'miscellaneous':
                miscCount++;
                break;
        }
    }
    
    // Update counts
    let completedElements = document.getElementsByClassName('completedEvents');
    for(let el of completedElements) {
        el.innerText = completedCount;
    }
    
    document.getElementsByClassName('liveEvents')[0].innerText = liveCount;
    document.getElementsByClassName('achievements')[0].innerText = achievementCount;
    document.getElementsByClassName('miscellaneous')[0].innerText = miscCount;
    
    // Calculate percentages and format
    const total = tweet_array.length;
    document.getElementsByClassName('completedEventsPct')[0].innerText = math.format((completedCount / total) * 100, {notation: 'fixed', precision: 2}) + '%';
    document.getElementsByClassName('liveEventsPct')[0].innerText = math.format((liveCount / total) * 100, {notation: 'fixed', precision: 2}) + '%';
    document.getElementsByClassName('achievementsPct')[0].innerText = math.format((achievementCount / total) * 100, {notation: 'fixed', precision: 2}) + '%';
    document.getElementsByClassName('miscellaneousPct')[0].innerText = math.format((miscCount / total) * 100, {notation: 'fixed', precision: 2}) + '%';
    
    // Count written tweets
    let writtenCount = 0;
    for(let tweet of tweet_array) {
        if(tweet.source === 'completed' && tweet.written) {
            writtenCount++;
        }
    }
    
    document.getElementsByClassName('written')[0].innerText = writtenCount;
    document.getElementsByClassName('writtenPct')[0].innerText = math.format((writtenCount / completedCount) * 100, {notation: 'fixed', precision: 2}) + '%';
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});
