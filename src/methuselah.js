const tiny = require('tiny-json-http')




const today = new Date();
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
const m = monthNames[today.getMonth()];
const d = today.getDate();

const wikiUri=`https://en.wikipedia.org/w/index.php?title=${m}_${d}&action=raw`




getPage(wikiUri)
    .then(data => {
        var eventTuples = parsePage(data);
        var result = findMostInterestingPair(eventTuples);
        var displayString = formatDatesForReport(result);
        console.log(result);
    })
    .catch(error => {
        console.log('Error: ', error);
    });




function getPage(url) {
    // return new pending promise
    // return data is contents of specified page
    return new Promise((resolve, reject) => {

        const request = tiny.get({url}, (err, response) => {
            if (err) {
                console.log('Error', err);
                reject(err);
            } else {
                const body = response.body;
                resolve(body);
            }
        });
    })
}


function parsePage(content) {
    // returns an array of all eventTuples on the page, in the form:
    // [year of event, description of event]
    // ISSUE: there are several sections, like BIRTHS, DEATHS, and EVENTS, each chronologically ordered internally, but they get smashed together in this array in that order. We could simply order the array, but first we would need to get information about what section they are in. Easy enough to do if we have only these three sections (just prepend "BIRTH OF" or "DEATH OF" where appropriate), but I need to investigate if there are other sections.
    var dates = content.match(/\*(.*) &ndash; (.*)/g);
    var pairs = [];
    for (i=0; i<dates.length; i++) {
        var year = parseInt(dates[i].match(/\*(.*) &ndash; (.*)/)[1].replace(/[\[\]]/g, ''));
        if (isNaN(year)) { console.log('NUTS!'); }
        var event = dates[i].match(/\*(.*) &ndash; ([^<]*)/)[2].replace(/[\[\]]/g, '');
        pairs.push([year, event]);
    }
    pairs.sort(([a, b], [c,d]) => a-c);
    return pairs;
}


function findMostInterestingPair(pairs) {
    // returns an array of exactly 2 eventTuples
    // ISSUE: for now, just returns two random dates, with the second guaranteed to be later than the first.
    // needs work, obviously, to be interesting.
    // eventual goal is to return an array of exactly 2 eventTuples representing the two most interesting events such that the second one is older now than the first one was when the second one happened. For example, say the year is 2015:
    // [
    //   [1967, 'The Beatles release their album "Sgt. Pepper's Lonely Hearts Club Band"], 
    //   [1991, 'Nirvana releases their album "Nevermind"']
    // ]
    // Because 2015 - 1991 = 24 = 1991 - 1967
    var olderEvent = Math.floor(Math.random() * (pairs.length - 2)); // minus 2 to make sure there is at least one event newer than this one
    var olderEvent = 351;
    var newerEvent = Math.floor(Math.random() * (pairs.length - olderEvent - 1)) + olderEvent; // ISSUE: this is not the right formula
    console.log(`length of pairs is ${pairs.length} and we are returning elements ${olderEvent} and ${newerEvent}`); ////
    
    return [pairs[olderEvent],pairs[newerEvent]];
}


function formatDatesForReport(eventTuple) {
    console.log("Event tuple:"); ////
    console.log(eventTuple); ////
    // returns a string explaining the result in plain English.
    // ISSUE: could maybe use some work to have a more eloquent-sounding phrase.
    // Because this sounds awkward:
    // 'Nirvana releases their album "Nevermind" (1991) is now as old as The Beatles release their album "Sgt. Pepper's Lonely Hearts Club Band" (1967) was when 'Nirvana releases their album "Nevermind" was new.'
    var returnString = `Today is ${m} ${d}, ${today.getYear()}. ${eventTuple[1][1]} (${eventTuple[1][0]}) is now as old as ${eventTuple[0][1]} (${eventTuple[0][0]}) was when ${eventTuple[1][1]} was new.`;
    return returnString;
}


