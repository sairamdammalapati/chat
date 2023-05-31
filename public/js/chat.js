const socket = io()

$myForm = document.querySelector('#my-form')
$myFormInput = $myForm.querySelector('input')
$myFormButton = $myForm.querySelector('button')
$locationButton = document.querySelector('#sendLocation')
$messages = document.querySelector('#messages')
$location=document.querySelector('#locationdiv')

//Tempates 
const messagetemplates = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
const sidebartemplate = document.querySelector('#side-bar-template').innerHTML

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    const html = Mustache.render(messagetemplates,{
        username: message.username,
        message : message.text,
        time : moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(location)=>{

    const html = Mustache.render(locationTemplate,{
        username : location.username,
        location : location.text,
        time : moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
$myForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $myFormButton.setAttribute('disabled','disabled')
    const message = $myFormInput.value
    
    socket.emit('sendMessage',message,(error)=>{
        $myFormButton.removeAttribute('disabled')
        $myFormInput.value=''
        $myFormInput.focus()
        if(error) {
            return console.log(error)
        }
    })
})

$locationButton.addEventListener('click',()=>{
    $locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation) {
        return alert('Ah oh your browser not supporting geolocation')
    }
   navigator.geolocation.getCurrentPosition((position)=>{
    console.log(position)
    const data = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    }
    socket.emit('location',data,()=>{
        $locationButton.removeAttribute('disabled')
        console.log("location shared")
    })
   })
})

socket.emit('join',{username,room},(error)=>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})