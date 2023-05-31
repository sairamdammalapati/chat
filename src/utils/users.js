const users = []
//add,remove,getuser,getusersInRoom

const addUser = ({ id, username, room }) => {
    if (!username || !room) {
        return {
            error: 'username and room are required'
        }
    }
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    //validate the date
    //existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //validate exising user
    if (existingUser) {
        return {
            error: 'username should be unique'
        }
    }
    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }

}

const removeUser = (id) => {
    //find uder
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)


}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}


export {addUser,removeUser,getUser,getUsersInRoom}

