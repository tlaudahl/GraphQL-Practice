const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdCards: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Card'
        }
    ],
});

module.exports = mongoose.model('User', userSchema)