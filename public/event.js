var Eventplatform = (function () {

// Local array to keep track of data
let comments = []
let guestList = []


// Elements
const eventWindowElement = document.querySelector('#event-window')
const eventCommentElement = document.querySelector('#comment-window')
const guestListElement = document.querySelector('#guestlist-window')

// Templates
const userTemplate = ({ username }) => `
<li class="media my-2">
  <div class="media-body">
    <b class="text-secondary">${username}</b>
  </div>
</li>
`

const commentTemplate = ({text, user}) => `
<div class="media my-3 chat-message">
  <div class="media-body">
    <div class="mt-0"><b>${user.username}</b></div>
    <p>
      ${text}
    </p>
  </div>
</div>
`

// Private frontend module
let frontend = {}

frontend.autoScroll = function () {
    let eW = eventCommentElement
    
    if (e.W.offsetHeight / (eW.scrollHeight - eW.scrollTop) > 0.85) {
        eW.scrollTop += 150
    }
}

frontend.addComment = function (comment) {
    let html = commentTemplate(comment)

    eventCommentElement.insertAdjacentElement('beforeend', html)

    frontend.autoScroll ()
}

frontend.addUser = function (user){
    let html = guestListTemplate (user)

    guestListElement.insertAdjacentElement('beforeend', html)
    frontend.autoScroll ()
}
// What is this?
frontend.getCommentHTML = function (comments) {
    let html = ''

    comments.forEach (e => {
        html += commentTemplate(e)
    })
    return html
}

frontend.displayComments = function (comments) {
    eventWindowElement.innerHTML.getCommentHTML(events)

}

//Initializing and empty object 
let module = {}

module.sendComment = function (comment) {
    comment.push(comment)
    frontend.addComment(comment)
}

//Return the comment array
module.getComment = function () {
    return comments
}

return module

function EventComment (comment, user)
    this.comment = comment
    this.user = user
    this.createdAt = new Date()
})


//method for writing a comment
module.sendComment2 = function (comment) {
    console.log("inde i sendcomment")
    // // The "credentials" option makes sure that the browser's cookies
    // are sent back and forth during a request
    // Please refer to the fetch() docs: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    let options = {
        method: 'post',
        credentials: 'include',
        headers: {
            'content-type':'application/json'
        },
        body: JSON.stringify(comment)
    }  
    fetch('/api/comment', options)
    .then(response => response.json())
    .then(response => {
        if (response.status != 'OK') {
            console.log("not okay: "+respnse)
        }
        else {
            console.log("okay: "+respnse)
        }    
    }) 
} 

//returns the comment array - server
module.getComment = function (event) {
    // The credentials option makes sure that the browsers cookies are sent back and forth during a request
    let options = {
        credentials: 'include'
    }
    return fetch('/api/comments', options)
    .then(response => response.json())
}


//module.getComments (EVENT_ID)
module.getComment = function (EVENT_ID) {
    // The credentials option makes sure that the browsers cookies are sent back and forth during a request
    let options = {
        credentials: 'include'
    }

    return fetch(`/api/events/${event_id}/comments, options`)
    .then(response => response.json())
}

// Function which sets up listeners for Socket.io events 
// And loads initial comments to the commen window
function initialize() {
    // Setup the socket 
    let socket = io() 

// What to do when the "new comment" event is received
socket.on('new comment', comment => {
    // Add the message to the chat window
    frontend.addComment(comment)
})

// Load all comments and display them
module.getComment()
.then(allComments => {
    comments = allComments

    frontend.displayComments(comments)
})
}

// Run the initialize function 
initialize()

return module

//Adding comment to event
function EventComment (text) {
    this.text = text
}

document.querySelector('#comment-form').addEventListener('submit', event => {
    event.preventDefault()

    let input = document.querySelector('#EventComment')

    let text = input.value
    let newCommentObject = new EventComment(text)

    Comment.sendComment(newCommentobject)

    input.value = ''



})



