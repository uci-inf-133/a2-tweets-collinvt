class Tweet {
    private text:string;
    time:Date;
    
    constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time);
    }
    
    //returns either 'completed', 'live', 'achievement', or 'miscellaneous'
    get source(): string {
        const text = this.text.toLowerCase();
        if (text.includes('just completed') || text.includes('just posted')) {
            return 'completed';
        } else if (text.includes('live') || text.includes('watch my')) {
            return 'live';
        } else if (text.includes('achieved') || text.includes('goal')) {
            return 'achievement';
        } else {
            return 'miscellaneous';
        }
    }
    
    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        // Remove the RunKeeper hashtag and URL
        let textWithoutHashtagAndUrl = this.text.replace(/#Runkeeper/gi, '').replace(/https:\/\/t\.co\/\w+/g, '').trim();
        
        // Common phrases that RunKeeper adds automatically
        const commonPhrases = [
            'Just completed a',
            'Just posted a',
            'with @Runkeeper. Check it out!',
            'with @Runkeeper.',
            'Check it out!',
            '- TomTom MySports Watch'
        ];
        
        // Remove all common phrases
        for (let phrase of commonPhrases) {
            textWithoutHashtagAndUrl = textWithoutHashtagAndUrl.replace(new RegExp(phrase, 'gi'), '');
        }
        
        // Check if there's any meaningful text left after removing activity info
        // Look for a dash which often separates the activity from user text
        const dashIndex = textWithoutHashtagAndUrl.indexOf(' - ');
        if (dashIndex !== -1) {
            const afterDash = textWithoutHashtagAndUrl.substring(dashIndex + 3).trim();
            if (afterDash.length > 0) {
                return true;
            }
        }
        
        return false;
    }
    
    get writtenText():string {
        if(!this.written) {
            return "";
        }
        
        // Find the text after the dash
        const dashIndex = this.text.indexOf(' - ');
        if (dashIndex !== -1) {
            let written = this.text.substring(dashIndex + 3);
            // Remove the URL and hashtag
            written = written.replace(/https:\/\/t\.co\/\w+/g, '').replace(/#Runkeeper/gi, '').trim();
            return written;
        }
        
        return "";
    }
    
    get activityType():string {
        if (this.source != 'completed') {
            return "unknown";
        }
        
        const text = this.text.toLowerCase();
        
        // Look for activity type patterns
        if (text.includes(' run')) {
            return 'run';
        } else if (text.includes(' walk')) {
            return 'walk';
        } else if (text.includes(' bike') || text.includes(' biking') || text.includes(' cycling')) {
            return 'bike';
        } else if (text.includes(' swim')) {
            return 'swim';
        } else if (text.includes('skiing')) {
            return 'ski';
        } else if (text.includes('elliptical')) {
            return 'elliptical';
        } else if (text.includes('spinning')) {
            return 'spinning';
        } else if (text.includes('rowing') || text.includes(' row')) {
            return 'rowing';
        } else if (text.includes('meditation')) {
            return 'meditation';
        } else if (text.includes('yoga')) {
            return 'yoga';
        } else if (text.includes('hiking')) {
            return 'hiking';
        } else if (text.includes('activity') || text.includes('freestyle')) {
            return 'activity';
        }
        
        return "unknown";
    }
    
    get distance():number {
        if(this.source != 'completed') {
            return 0;
        }
        
        // Regular expression to find distance patterns like "5.23 km" or "3.45 mi"
        const kmPattern = /(\d+\.\d+)\s*km/i;
        const miPattern = /(\d+\.\d+)\s*mi/i;
        
        const kmMatch = this.text.match(kmPattern);
        const miMatch = this.text.match(miPattern);
        
        if (miMatch) {
            return parseFloat(miMatch[1]);
        } else if (kmMatch) {
            // Convert km to miles (1 km = 0.621371 miles, or 1 mi = 1.609 km)
            return parseFloat(kmMatch[1]) / 1.609;
        }
        
        return 0;
    }

    get sentiment(): any {
        if (!this.written) {
            return { score: 0, label: 'neutral', color: '#6c757d' };
        }
        
        // Call the analyzeSentiment function (which will be available from sentiment.js)
        return (window as any).analyzeSentiment(this.writtenText);
    }

    getHTMLTableRow(rowNumber:number):string {
    // Extract the URL from the tweet
    const urlMatch = this.text.match(/https:\/\/t\.co\/\w+/);
    const url = urlMatch ? urlMatch[0] : '#';
    
    const activityType = this.activityType;
    const writtenText = this.writtenText || 'No written text';
    const sentiment = this.sentiment;
    
    return `<tr>
        <td>${rowNumber}</td>
        <td>${activityType}</td>
        <td>${writtenText}</td>
        <td><span style="color: ${sentiment.color}; font-weight: bold;">${sentiment.label}</span></td>
        <td><a href="${url}" target="_blank">Link</a></td>
    </tr>`;
    }
}
