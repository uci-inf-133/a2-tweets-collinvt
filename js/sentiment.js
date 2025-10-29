// Sentiment analysis using positive and negative word lists

const POSITIVE_WORDS = [
    'good', 'great', 'awesome', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'best', 'better', 'love', 'loved', 'happy', 'beautiful', 'perfect', 'nice',
    'enjoyed', 'enjoy', 'fun', 'pleasant', 'excited', 'strong', 'easy', 'fast',
    'faster', 'proud', 'win', 'winner', 'success', 'successful', 'brilliant',
    'super', 'terrific', 'cool', 'pretty', 'glad', 'yay', 'thanks', 'thank'
];

const NEGATIVE_WORDS = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'worse', 'hate', 'hated',
    'sad', 'ugly', 'poor', 'difficult', 'hard', 'slow', 'slower', 'tired',
    'exhausted', 'pain', 'painful', 'hurt', 'sore', 'tough', 'struggle',
    'struggled', 'fail', 'failed', 'failure', 'sick', 'injury', 'injured',
    'disappointing', 'disappointed', 'frustrating', 'frustrated', 'annoying'
];

function analyzeSentiment(text) {
    if (!text || text.length === 0) {
        return { score: 0, label: 'neutral', color: '#6c757d' };
    }
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (let word of words) {
        // Remove punctuation
        word = word.replace(/[.,!?;:]/g, '');
        
        if (POSITIVE_WORDS.includes(word)) {
            positiveCount++;
        }
        if (NEGATIVE_WORDS.includes(word)) {
            negativeCount++;
        }
    }
    
    const score = positiveCount - negativeCount;
    
    let label, color;
    if (score > 0) {
        label = 'positive';
        color = '#28a745'; // green
    } else if (score < 0) {
        label = 'negative';
        color = '#dc3545'; // red
    } else {
        label = 'neutral';
        color = '#6c757d'; // gray
    }
    
    return { score, label, color, positiveCount, negativeCount };
}
