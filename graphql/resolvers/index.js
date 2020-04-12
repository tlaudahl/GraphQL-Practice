const bcrypt = require('bcryptjs')
const Card = require('../../models/card');
const User = require('../../models/user');

const cards = async cardIds => {
    try {
        const cards = await Card.find({_id: {$in: cardIds}});
        return cards.map(card => {
            return {
                ...card._doc,
                _id: card.id,
                date: new Date(card._doc.date).toISOString(),
                creator: user.bind(this, card.creator)
            };
        });
    } catch (err) {
        throw err;
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId);
        return { 
            ...user._doc, 
            _id: user.id,
            createdCards: cards.bind(this, user._doc.createdEvents)
        }
    } catch (err) {
        throw err;
    }
}

module.exports = {
    cards: async () => {
        try {
            const cards = await Card.find()
            return cards.map(card => {
                return { 
                    ...card._doc, 
                    _id: card.id,
                    date: new Date(card._doc.date).toISOString(),
                    creator: user.bind(this, card._doc.creator)
                };
            })
        } catch (err) {
            throw err;
        }
    },
    createCard: async args => {
        const card = new Card({
        title: args.cardInput.title,
        question: args.cardInput.question,
        answer: args.cardInput.answer,
        date: new Date(args.cardInput.date),
        creator: '5e9264ef67662106782ffc1f'
        });
        let createdEvent;
        try {
            const result = await card.save()
            createdEvent = { 
                ...result._doc, 
                _id: result._doc._id.toString(),
                date: new Date(card._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById('5e9264ef67662106782ffc1f')
            if (!creator) {
                throw new Error('User not found')
            }
            creator.createdCards.push(card)
            await creator.save();
            return createdEvent;
        } catch (err) {
            throw err
        }
    },
    createUser: async args => {
        try {
            const existingUser = await User.findOne({email: args.userInput.email})
            if (existingUser) {
                throw new Error('User with that email exists already')
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return { ...result._doc, password: null, _id: result.id }
        } catch (err) {
            throw err;
        }
    }
}