const express = require('express');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const Card = require('./models/card');
const User = require('./models/user');

const app = express();

app.use(express.json())

app.use(
    '/graphql', 
    graphqlHttp({
        schema: buildSchema(`
            type Card {
                _id: ID!
                title: String!
                question: String!
                answer: String!
                date: String!
            }

            type User {
                _id: ID!
                email: String!
                password: String
            }

            input CardInput {
                title: String!
                question: String!
                answer: String!
                date: String!
            }

            input UserInput {
                email: String!
                password: String!
            }

            type RootQuery {
                cards: [Card!]!
            }

            type RootMutation {
                createCard(cardInput: CardInput): Card
                createUser(userInput: UserInput): User
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            cards: () => {
                return Card.find().then(cards => {
                    return cards.map(card => {
                        return { ...card._doc, _id: card.id };
                    })
                }).catch(err => {
                    throw err;
                })
            },
            createCard: args => {
                const card = new Card({
                    title: args.cardInput.title,
                    question: args.cardInput.question,
                    answer: args.cardInput.answer,
                    date: new Date(args.cardInput.date),
                    creator: '5e8d60c59081d2497c2f39b2'
                });
                let createdEvent;
                return card.save()
                .then(result => {
                    createdEvent = { ...result._doc, _id: card.id };
                    return User.findById('5e8d60c59081d2497c2f39b2')
                })
                .then(user => {
                    if (!user) {
                        throw new Error('User not found')
                    }
                    user.createdCards.push(card)
                    return user.save();
                })
                .then(result => {
                    return createdEvent;
                })
                .catch(err => {
                    throw err;
                });
            },
            createUser: args => {
                return User.findOne({email: args.userInput.email}).then(user => {
                    if (user) {
                        throw new Error('User with that email exists already')
                    }
                    return bcrypt.hash(args.userInput.password, 12)
                })
                .then(hashedPass => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPass
                    });
                    return user.save();
                }).then(result => {
                    return { ...result._doc, password: null, _id: result.id }
                }).catch(err => {
                    throw err
                })
            }
        },
        graphiql: true
    })
);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-ixzwl.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
.then(() => {
    app.listen(3000);
})
.catch(err => {
    console.error(err)
})
