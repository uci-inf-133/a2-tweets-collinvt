let tweet_array = [];
let written_tweets = [];
let currentFilter = 'all';

function parseTweets(runkeeper_tweets) {
    //Do not proceed if no tweets loaded
    if(runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }
    
    tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });
    
    // Filter to just written tweets
    written_tweets = tweet_array.filter(tweet => tweet.written);
    
    // Update total count of written tweets
    document.getElementById('searchCount').innerText = written_tweets.length;
}

function addEventHandlerForSearch() {
    // Get search input element
    const searchInput = document.getElementById('textFilter');
    
    // Add event listener for input changes
    searchInput.addEventListener('input', function() {
        performSearch();
    });
}

function performSearch() {
    const searchInput = document.getElementById('textFilter');
    const searchText = searchInput.value.toLowerCase().trim();
    
    // Update searchText span
    document.getElementById('searchText').innerText = searchText || '???';
    
    // Get the table body
    const tableBody = document.getElementById('tweetTable');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Filter tweets that contain search text
    let matchingTweets = written_tweets.filter(tweet => {
        const textMatches = searchText === '' || tweet.writtenText.toLowerCase().includes(searchText);
        
        // Apply sentiment filter
        let sentimentMatches = true;
        if (currentFilter !== 'all') {
            sentimentMatches = tweet.sentiment.label === currentFilter;
        }
        
        return textMatches && sentimentMatches;
    });
    
    // Update count
    document.getElementById('searchCount').innerText = matchingTweets.length;
    
    // Add rows for each matching tweet
    for(let i = 0; i < matchingTweets.length; i++) {
        const row = matchingTweets[i].getHTMLTableRow(i + 1);
        tableBody.innerHTML += row;
    }
}

function addSentimentFilters() {
    // Create filter buttons
    const main = document.querySelector('main');
    const filterDiv = document.createElement('div');
    filterDiv.style.marginBottom = '20px';
    filterDiv.innerHTML = `
        <strong>Filter by sentiment:</strong>
        <button id="filter-all" class="btn btn-sm btn-secondary active">All</button>
        <button id="filter-positive" class="btn btn-sm btn-success">Positive</button>
        <button id="filter-neutral" class="btn btn-sm btn-secondary">Neutral</button>
        <button id="filter-negative" class="btn btn-sm btn-danger">Negative</button>
    `;
    
    // Insert after first paragraph
    const firstP = main.querySelector('p');
    firstP.parentNode.insertBefore(filterDiv, firstP.nextSibling);
    
    // Add event listeners
    document.getElementById('filter-all').addEventListener('click', function() {
        setFilter('all');
    });
    document.getElementById('filter-positive').addEventListener('click', function() {
        setFilter('positive');
    });
    document.getElementById('filter-neutral').addEventListener('click', function() {
        setFilter('neutral');
    });
    document.getElementById('filter-negative').addEventListener('click', function() {
        setFilter('negative');
    });
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update button styles
    document.querySelectorAll('[id^="filter-"]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('filter-' + filter).classList.add('active');
    
    // Re-run search with new filter
    performSearch();
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
    addEventHandlerForSearch();
    loadSavedRunkeeperTweets().then(function(tweets) {
        parseTweets(tweets);
        addSentimentFilters();
    });
});
