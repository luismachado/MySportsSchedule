var request = require('request');
var cheerio = require('cheerio');
var winston = require('winston');
var fs 		= require('fs');
var configs = require('../config/db');


//var tagsToHighlight = ['1080p'];
//var tagsToFilterOut = ['XBOX360','DVDRiP', 'BDRip'];
var namesToFilterOut = ['CAM', 'DVDSCR','Playbabes', 'Gurls', 'HDRiP','XBOX360','DVDRiP', 'BDRip'];
var namesToHighlight = ['MythBusters', 'Black Sails','Time USA','1080p'];

function filterOutReleases(sectionContent) {

	for (var contentIdx = sectionContent.length-1; contentIdx >= 0; contentIdx--) {
		if (sectionContent[contentIdx].filterOut){			
			sectionContent.splice(contentIdx, 1);	
		} else {
			delete sectionContent[contentIdx].filterOut;
		}
	}

	return sectionContent;
}

function toFilterOutByName(releaseName, toFilterOut) {
	for(var namesIdx = 0; namesIdx < toFilterOut.length; namesIdx++) {
		if(releaseName.indexOf(toFilterOut[namesIdx]) != -1)
			return true;
	}
	return false;
}

function toHightlightByName(releaseName, toHighlight) {
	for(var namesIdx = 0; namesIdx < toHighlight.length; namesIdx++) {
		if(releaseName.indexOf(toHighlight[namesIdx]) != -1) 
			return true;
	}
	return false;
}

function finishSections (sectionsContent) {

	return {
			    'Apps'   : sectionsContent[0],
			    'eBooks' : sectionsContent[1],
			    'Games'  : sectionsContent[2],
			    'Movies' : sectionsContent[3],
			    'Music'  : sectionsContent[4],
			    'TVShows': sectionsContent[5]
			};
}

function dateDiffInDays(currentDate, postDate) {
    var date1 = postDate;
    var date2 = currentDate;
    var diffDays = -1;
    try {
    	var utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate(), date1.getHours(), date1.getMinutes());
    	var utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate(), date2.getHours(), date2.getMinutes());
    	diffDays = (utc2 - utc1) / (1000 * 60 * 60 * 24); 
	} catch (err) {
			winston.warn('Error parsing date.')
			winston.warn(err);
	}

    return diffDays; 
}

function getDateFromText(text) {
	var date;
	var truncatePostion = text.indexOf(" in ");
	if(truncatePostion != -1) {
		text = text.substring(0,truncatePostion).replace("Posted on ", "").replace(", ","|").replace(" at ","|").
					replace(/ /g, "|").replace(":","|").replace(new RegExp('(\?:st|nd|rd|th)'),"");;
		var textBits = text.split("|");
		
		return new Date(textBits[1] + " " + textBits[0] + " " + textBits[2] + " " +
					textBits[3] + ":" + textBits[4] + ":00 " + textBits[5]);
	}	
}

function generateTorrentURL(releaseTitle) {

	return "http://www.kickass.to/usearch/" + releaseTitle.replace(/ /g, ".") + "/";

}

function getDirectDownloadURL(url) {

	var urlObject = {urlLink : url, urlName : "Link"}

	if(url.indexOf('hdtv') != -1 || url.indexOf('HDTV') != -1) {
		if(url.indexOf('720p') != - 1)
			urlObject.urlName = "720p";
		else
			urlObject.urlName = "HDTV";
	}
	return urlObject;
}

function getPageContents(pageNum, filterContents, sectionsContent, sectionsList, toHighlight, toFilterOut, callback) {
	
	request(configs.url+pageNum+"/", function (error, response, html){        
		if(!error){
		    var $ = cheerio.load(html);

		    $('.entry').each(function(){
		    	var release = { title : "", url : "", url_download : "", filterOut : false, highlight : false};
		    	var entry = $(this);

		    	release.title = entry.find('.title a').text().replace("\r\n","");
		    	release.url =   entry.find('.postReadMore').attr('href');
		    	release.url_download = { torrent : generateTorrentURL(release.title),
		    							  direct : {urlLink : "", urlName : ""}};

		    	entry.find(".entry-content p a:contains('UPLOADED')").each(function(){
		    		if(release.url_download.direct.urlName != "720p") {
		    			var directDownload = getDirectDownloadURL($(this).attr('href'));
						release.url_download.direct = directDownload;
		    		}
				});

		    	// Filter out by release title
		    	if(filterContents)		    	
		    		release.filterOut  = toFilterOutByName(release.title, toFilterOut);
		    	if(filterContents)		    	
		    		release.highlight  = toHightlightByName(release.title, toHighlight);

		    	// capture all tags
		    	entry.find('.postSubTitle a').each(function() {
		    		var tagDOM = $(this);
		    		if(tagDOM.attr('rel') == 'category tag') {
		    			var tag = {'name' : '', 'url' : ''}
		    			tag.name = tagDOM.text();
		    			tag.url  = tagDOM.attr('href');

		    			var sectionIdx = sectionsList.indexOf(tag.url);
		    			if(sectionIdx != -1)
		    				sectionsContent[sectionIdx].push(release);
		    		}
	    		});	
				    	        
		    });

			var tempo = $('.entry').last().find('.postSubTitle').text();
			//if still less that 1 day
			var dateDiff =	dateDiffInDays(new Date(), getDateFromText(tempo));			
			if(dateDiff != -1 && dateDiff < 1) {
				//call next page
				getPageContents(++pageNum, filterContents,sectionsContent, sectionsList, toHighlight, toFilterOut, callback)
			} else if(dateDiff == -1) {
				//finish section and send JSON				
				winston.info("Finished with errors");
				callback.json(finishSections([[],[],[],[],[],[]]));
			} else {
				//finish section and send JSON				
				winston.info("Finished");
				callback.json(finishSections(sectionsContent));
			}
		}
	});
}

module.exports = function(app) {

	app.get('/MyReleaseFeed/download', function(req, res){

		var data = fs.readFileSync('./config/data.json'), paramsObj;

		try {
			paramsObj = JSON.parse(data);
			
			winston.info("MyReleases - Request from " + req.ip);
	    	getPageContents(1,true,[[],[],[],[],[],[]],configs.sectionsLista,
	    		paramsObj.namesToHighlight,paramsObj.namesToFilterOut,res);
		}
		catch (err) {
			winston.warn('There has been an error parsing your JSON.')
			winston.warn(err);
		}
	});

	app.get('/MyReleaseFeed', function(req, res) {
            res.sendfile('./public/index.html');
    });



};