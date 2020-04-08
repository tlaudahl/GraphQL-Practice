const express = require('express');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Card = require('./models/event');

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

            input CardInput {
                title: String!
                question: String!
                answer: String!
                date: String!
            }

            type RootQuery {
                cards: [Card!]!
            }

            type RootMutation {
                createCard(cardInput: CardInput): Card
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
                    date: new Date(args.cardInput.date)
                });
                return card.save()
                .then(result => {
                    return {...result._doc};
                })
                .catch(err => {
                    throw err;
                });
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
