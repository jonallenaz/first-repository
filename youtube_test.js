var catIndex = '';
var dataURL = 'http://gdata.youtube.com/feeds/users/latenight/uploads?alt=json-in-script&max-results=50';
var startIndex = 1;
var ytData = [];

getVideos(catIndex, dataURL, startIndex);

	function getVideos(catIndex,dataURL,startIndex){
		if(!startIndex){ startIndex = 1; } //if this wasn't passed in, get the first result.

		//get the video data
		$.ajax({
			url:dataURL + '&start-index=' + startIndex,
			dataType:'jsonp'
		})
		.done(function(data){
			//create the array for the videos within this category if needed
			if(typeof ytData[catIndex].videos == 'undefined'){
				ytData[catIndex].videos = [];
			}

			//for each video, try adding it to the correct category
			for (var length = data.feed.entry.length - 1,i = 0; i < length; i++) {
				//if video is not restricted for some reason
				if(!data.feed.entry[i].app$control || !data.feed.entry[i].app$control.yt$state){
					//add to array for output
					ytData[catIndex].videos.unshift(data.feed.entry[i]);

					//update the position of the default video
/*					if(defaultVideo.cat === catIndex){ defaultVideo.ind++; }
*/
					//try finding the default video in the list of results
/*					if(defaultVideo.id == getID(data.feed.entry[i].media$group.media$player[0].url)){
						//update the object for use
						defaultVideo.cat = catIndex; //the category
						defaultVideo.ind = 0; //reset the video position in the category
						defaultVideo.found = true; //say that a match was found
					}
*/				}
			}

			//get the total number of videos in the category list
			var totalInCategory = data.feed.openSearch$totalResults.$t,
				searchStartIndex = data.feed.openSearch$startIndex.$t;

			//if there are more results, get them.
			if((searchStartIndex + ajaxMaxResults - 1) < totalInCategory){
				getVideos(catIndex,dataURL,(searchStartIndex + ajaxMaxResults));
			}

			//update total videos in category
			$('.youtube-container .nav .filter.ind-'+catIndex+' .totalVideos').text(ytData[catIndex].videos.length);

			//when the first page of videos has been downloaded, display it.
			if(catIndex === 0){
				//create the UI for the first time
				updatePage(0,true);
			}
		});
	}
