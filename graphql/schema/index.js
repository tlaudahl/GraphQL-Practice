const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Card {
        _id: ID!
        title: String!
        question: String!
        answer: String!
        date: String!
        creator: User!
    }

    type User {
        _id: ID!
        email: String!
        password: String
        createdCards: [Card!]
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
`)