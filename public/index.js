/*
 * Name: Ian Band
 * Email: bandi@oregonstate.edu
 */

var allPosts = [];

function insertNewPost(description, photoURL, score, title){
	var newPostHTML = createPostHTML(description, photoURL, score, title);
	var postsSection = document.getElementById('posts');
	postsSection.insertAdjacentHTML('beforeend', newPostHTML);
}
function createPostHTML(description, photoURL, score, title) {
	var postTemplateArgs = {
		description: description,
		photoURL: photoURL,
		score: score,
		title: title
	};

	var postHTML = Handlebars.templates.post(postTemplateArgs);
	console.log("== postHTML:", postHTML);
	return postHTML;
}


/***************************************************************************



/*
 * This function checks whether all of the required inputs were supplied by
 * the user and, if so,i nserting a new post into the page constructed using
 * these inputs.  If the user did not supply a required input, they instead
 * recieve an alert, and no new post is inserted.
 */
 
function handleUpvoteClick(postTitle){
}
function handleModalAcceptClick() {

  var description = document.getElementById('post-text-input').value.trim();
  var photoURL = document.getElementById('post-photo-input').value.trim();
  var postTitle = document.getElementById('post-title-input').value.trim();

  if (!postTitle || !photoURL) {
    alert("You must have a title and photo url!");
  } else {
	
	var postRequest = new XMLHttpRequest();
    var postURL = "/newPost";
    postRequest.open('POST', postURL, true);
	
	var postObj = {
		score: 1,
		description: description,
		photoURL: photoURL,
		title: postTitle
    };
	
	
	var requestBody = JSON.stringify(postObj);
	console.log("stringifyd body of request: " + requestBody);
	postRequest.setRequestHeader('Content-Type', 'application/json');
	
	
	
	postRequest.addEventListener('load', function (event) {
      if (event.target.status !== 200) {
        alert("Error storing post in database:\n\n\n" + event.target.response);
      } else {
		
        var newPost = createPostHTML(description, photoURL, 1, postTitle);  //createPostHTML(description, photoURL, score, title)
        var postContainer = document.getElementById('posts');

        postContainer.insertAdjacentHTML('beforeend', newPost);
		allPosts.push(newPost);
		console.log('post created successfuly!');
      }
    });
	
	console.log('sending request to make post');
	postRequest.send(requestBody);
	
	
    clearFiltersAndReinsertPosts();

    hideSellSomethingModal();

  }

}

function upvotePost(){ //very sloppy, can only be used on /p/:postTitle page...
	var postToUpvote = document.getElementsByClassName('post');
	var postToUpvoteTitle = postToUpvote[0].getAttribute('data-title');
	console.log('the title of the post you are attempting to upvote is: ' + postToUpvoteTitle)
	
	var postRequest = new XMLHttpRequest();
    var postURL = '/p/' + postToUpvoteTitle + '/upvote';
    postRequest.open('POST', postURL, true);
	
	
	postRequest.addEventListener('load', function (event) {
      if (event.target.status !== 200) {
        alert("Error sending upvote request:\n\n\n" + event.target.response);
      } else {//apply upvote
		console.log("upvote successful!");
		var voteCount = parseInt(document.getElementsByClassName('post-score')[0].textContent);
		voteCount++;
		document.getElementsByClassName('post-score')[0].textContent = voteCount;
		
      }
    });
	postRequest.send();
}
function downvotePost(){ //very sloppy, can only be used on /p/:postTitle page...
	var postToDownvote = document.getElementsByClassName('post');
	var postToDownvoteTitle = postToDownvote[0].getAttribute('data-title');
	console.log('the title of the post you are attempting to upvote is: ' + postToDownvoteTitle)
	
	var postRequest = new XMLHttpRequest();
    var postURL = '/p/' + postToDownvoteTitle + '/downvote';
    postRequest.open('POST', postURL, true);
	
	
	postRequest.addEventListener('load', function (event) {
      if (event.target.status !== 200) {
        alert("Error sending downvote request:\n\n\n" + event.target.response);
      } else {//apply upvote
		console.log("downvote successful!");
		var voteCount = parseInt(document.getElementsByClassName('post-score')[0].textContent);
		voteCount--;
		document.getElementsByClassName('post-score')[0].textContent = voteCount;
		
      }
    });
	postRequest.send();
}


/*
 * This function clears all filter values, causing all posts to be re-inserted
 * into the DOM.
 */
function clearFiltersAndReinsertPosts() {

  document.getElementById('filter-text').value = "";

  var filterConditionCheckedInputs = document.querySelectorAll("#filter-condition input");
  for (var i = 0; i < filterConditionCheckedInputs.length; i++) {
    filterConditionCheckedInputs[i].checked = false;
  }

  doFilterUpdate();

}



/*
 * This function shows the "sell something" modal by removing the "hidden"
 * class from the modal and backdrop.
 */
function showSellSomethingModal() {

  var showSomethingModal = document.getElementById('sell-something-modal');
  var modalBackdrop = document.getElementById('modal-backdrop');

  showSomethingModal.classList.remove('hidden');
  modalBackdrop.classList.remove('hidden');

}


/*
 * This function clears any user-entered inputs in the "sell something" modal.
 */
function clearSellSomethingModalInputs() {

  var postTextInputElements = [
    document.getElementById('post-text-input'),
    document.getElementById('post-photo-input'),
	document.getElementById('post-title-input')
  ];

  /*
   * Clear any text entered in the text inputs.
   */
  postTextInputElements.forEach(function (inputElem) {
    inputElem.value = '';
  });

}


/*
 * This function hides the "sell something" modal by adding the "hidden"
 * class from the modal and backdrop.  It also clears any existing inputs in
 * the modal's input fields when the modal is hidden.
 */
function hideSellSomethingModal() {

  var showSomethingModal = document.getElementById('sell-something-modal');
  var modalBackdrop = document.getElementById('modal-backdrop');

  showSomethingModal.classList.add('hidden');
  modalBackdrop.classList.add('hidden');

  clearSellSomethingModalInputs();

}


/*
 * A function to apply the current filters to a specific post.  Returns true
 * if the post passes the filters and should be displayed and false otherwise.
 */
function postPassesFilters(post, filters) {

  if (filters.text) {
    var postDescription = post.description.toLowerCase();
    var filterText = filters.text.toLowerCase();
    if (postDescription.indexOf(filterText) === -1) {
      return false;
    }
  }
  return true;
}


/*
 * Applies the filters currently entered by the user to the set of all posts.
 * Any post that satisfies the user's filter values will be displayed,
 * including posts that are not currently being displayed because they didn't
 * satisfy an old set of filters.  Posts that don't satisfy the filters are
 * removed from the DOM.
 */
function doFilterUpdate() {

  /*
   * Grab values of filters from user inputs.
   */
  var filters = {
    text: document.getElementById('filter-text').value.trim()
  }

  /*
   * Remove all "post" elements from the DOM.
   */
  var postContainer = document.getElementById('posts');
  while(postContainer.lastChild) {
    postContainer.removeChild(postContainer.lastChild);
  }

  /*
   * Loop through the collection of all "post" elements and re-insert ones
   * that meet the current filtering criteria.
   */
  allPosts.forEach(function (post) {
    if (postPassesFilters(post, filters)) {
      insertNewPost(post.description, post.photoURL, post.score, post.title);   //insertNewPost(description, photoURL, score, title)
    }
  });

}


/*
 * This function parses an existing DOM element representing a single post
 * into an object representing that post and returns that object.  The object
 * is structured like this:
 *
 * {
 *   description: "...",
 *   photoURL: "...",
 *   score: ...
 * }
 */
function parsePostElem(postElem) {

  var post = {
    score: postElem.getAttribute('data-score'),
	title: postElem.getAttribute('data-title')
  };

  var postImageElem = postElem.querySelector('.post-image-container img');
  post.photoURL = postImageElem.src;
  post.description = postImageElem.alt;

  return post;

}





/*
 * Wait until the DOM content is loaded, and then hook up UI interactions, etc.
 */
window.addEventListener('DOMContentLoaded', function () {

  /*
   * Remember all of the initial post elements initially displayed in the page.
   */
  var postElems = document.getElementsByClassName('post');
  for (var i = 0; i < postElems.length; i++) {
    allPosts.push(parsePostElem(postElems[i]));
  }


  var sellSomethingButton = document.getElementById('sell-something-button');
  if (sellSomethingButton) {
    sellSomethingButton.addEventListener('click', showSellSomethingModal);
  }

  var modalAcceptButton = document.getElementById('modal-accept');
  if (modalAcceptButton) {
    modalAcceptButton.addEventListener('click', handleModalAcceptClick);
  }

  var modalHideButtons = document.getElementsByClassName('modal-hide-button');
  for (var i = 0; i < modalHideButtons.length; i++) {
    modalHideButtons[i].addEventListener('click', hideSellSomethingModal);
  }

  var filterUpdateButton = document.getElementById('filter-update-button');
  if (filterUpdateButton) {
    filterUpdateButton.addEventListener('click', doFilterUpdate);
  }
  
  var upvoteButton = document.getElementById('post-upvote');
  if (upvoteButton){
	  upvoteButton.addEventListener('click', upvotePost);
  }
  var downvoteButton = document.getElementById('post-downvote');
  if (downvoteButton){
	  downvoteButton.addEventListener('click', downvotePost);
  }

});
