const getTimeWithMessage = (username,text)=>{
    return {
        username,
        text,
    createdAt : new Date().getTime()
    }
}

export {getTimeWithMessage}