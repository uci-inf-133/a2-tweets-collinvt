let tweet_array = [];
let activity_vis_spec;
let scatterplot_spec;
let aggregate_spec;
let currentView = 'scatter';

function parseTweets(runkeeper_tweets) {
    //Do not proceed if no tweets loaded
    if(runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }
    
    tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });
    
    // Count activities by type
    let activityCounts = {};
    let completedTweets = tweet_array.filter(t => t.source === 'completed');
    
    for(let tweet of completedTweets) {
        let type = tweet.activityType;
        if(type !== 'unknown') {
            activityCounts[type] = (activityCounts[type] || 0) + 1;
        }
    }
    
    // Convert to array
    let activityData = [];
    for(let type in activityCounts) {
        activityData.push({
            activity: type,
            count: activityCounts[type]
        });
    }
    
    // Sort to find top 3
    activityData.sort((a, b) => b.count - a.count);
    
    // Update number of activities
    document.getElementById('numberActivities').innerText = activityData.length;
    
    // Create bar chart of activity counts
    activity_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "A graph of the number of Tweets containing each type of activity.",
        "data": {
            "values": activityData
        },
        "mark": "bar",
        "encoding": {
            "x": {
                "field": "activity",
                "type": "nominal",
                "title": "Activity Type"
            },
            "y": {
                "field": "count",
                "type": "quantitative",
                "title": "Number of Tweets"
            }
        }
    };
    
    vegaEmbed('#activityVis', activity_vis_spec, {actions:false});
    
    // Get top 3 activities
    let top3 = activityData.slice(0, 3).map(d => d.activity);
    
    // Update the spans with top 3 activities
    document.getElementById('firstMost').innerText = top3[0] || '';
    document.getElementById('secondMost').innerText = top3[1] || '';
    document.getElementById('thirdMost').innerText = top3[2] || '';
    
    // Prepare data
    let distanceData = [];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for(let tweet of completedTweets) {
        if(top3.includes(tweet.activityType) && tweet.distance > 0) {
            let dayOfWeek = daysOfWeek[tweet.time.getDay()];
            distanceData.push({
                activity: tweet.activityType,
                day: dayOfWeek,
                distance: tweet.distance
            });
        }
    }
    
    // Create scatterplot
    scatterplot_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Distance by day of week for top 3 activities",
        "data": {
            "values": distanceData
        },
        "mark": "point",
        "encoding": {
            "x": {
                "field": "day",
                "type": "nominal",
                "title": "Day of Week",
                "sort": daysOfWeek
            },
            "y": {
                "field": "distance",
                "type": "quantitative",
                "title": "Distance (miles)"
            },
            "color": {
                "field": "activity",
                "type": "nominal",
                "title": "Activity Type"
            }
        }
    };
    
    // Create aggregated view
    aggregate_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Average distance by day of week for top 3 activities",
        "data": {
            "values": distanceData
        },
        "mark": "bar",
        "encoding": {
            "x": {
                "field": "day",
                "type": "nominal",
                "title": "Day of Week",
                "sort": daysOfWeek
            },
            "y": {
                "field": "distance",
                "type": "quantitative",
                "aggregate": "mean",
                "title": "Average Distance (miles)"
            },
            "color": {
                "field": "activity",
                "type": "nominal",
                "title": "Activity Type"
            },
            "xOffset": {
                "field": "activity"
            }
        }
    };
    
    // Initially show scatterplot
    vegaEmbed('#distanceVis', scatterplot_spec, {actions:false});
    
    // Calculate longest/shortest activities
    let activityDistances = {};
    for(let type of top3) {
        activityDistances[type] = [];
    }
    
    let weekdayDistances = [];
    let weekendDistances = [];
    
    for(let tweet of completedTweets) {
        if(top3.includes(tweet.activityType) && tweet.distance > 0) {
            activityDistances[tweet.activityType].push(tweet.distance);
            
            let dayOfWeek = tweet.time.getDay();
            if(dayOfWeek === 0 || dayOfWeek === 6) {
                weekendDistances.push(tweet.distance);
            } else {
                weekdayDistances.push(tweet.distance);
            }
        }
    }
    
    // Find longest and shortest activities
    let averages = {};
    for(let type in activityDistances) {
        let distances = activityDistances[type];
        if(distances.length > 0) {
            let sum = distances.reduce((a, b) => a + b, 0);
            averages[type] = sum / distances.length;
        }
    }
    
    let longestActivity = '';
    let shortestActivity = '';
    let maxAvg = -1;
    let minAvg = Infinity;
    
    for(let type in averages) {
        if(averages[type] > maxAvg) {
            maxAvg = averages[type];
            longestActivity = type;
        }
        if(averages[type] < minAvg) {
            minAvg = averages[type];
            shortestActivity = type;
        }
    }
    
    // Calculate weekday vs weekend averages
    let weekdayAvg = weekdayDistances.length > 0 ? 
        weekdayDistances.reduce((a, b) => a + b, 0) / weekdayDistances.length : 0;
    let weekendAvg = weekendDistances.length > 0 ? 
        weekendDistances.reduce((a, b) => a + b, 0) / weekendDistances.length : 0;
    
    let longerDay = weekdayAvg > weekendAvg ? 'weekdays' : 'weekends';
    
    // Update the text
    document.getElementById('longestActivityType').innerText = longestActivity;
    document.getElementById('shortestActivityType').innerText = shortestActivity;
    document.getElementById('weekdayOrWeekendLonger').innerText = longerDay;
}

// Add event listener for the aggregate button
document.addEventListener('DOMContentLoaded', function (event) {
    loadSavedRunkeeperTweets().then(parseTweets);
    
    document.getElementById('aggregate').addEventListener('click', function() {
        if(currentView === 'scatter') {
            vegaEmbed('#distanceVis', aggregate_spec, {actions:false});
            currentView = 'aggregate';
        } else {
            vegaEmbed('#distanceVis', scatterplot_spec, {actions:false});
            currentView = 'scatter';
        }
    });
});
