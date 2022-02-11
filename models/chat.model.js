const mongoose = require ('mongoose');

var chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required.'
    },
    message: {
        type: String
    },
    room: {
        type: String,
        default: "room"
    },
    uid: {
        type: String,
        default: "uid"
    },
});

// mongoose.model('Chat', chatSchema, 'chats');

var Chat = module.exports = mongoose.model('Chat', chatSchema);