const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLList,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');
const app = express();

// dummy data -- this would be in a database
// In a fully setup application, the resolve() is where you'd make an actual SQL query
// Since this is a small application to test graphQL, will use static data.
const authors = [
    {id: 1, name: "Jon Krakauer"},
    {id: 2, name: "Jonn Steinbeck"},
    {id: 3, name: "William Shakespeare"},
    {id: 4, name: "Herman Melville"},
    {id: 5, name: "Yann Martel"},
];

const books = [
    { id: 1, name: "Into the Wild", authorId: 1},
    { id: 2, name: "Of Mice and Men", authorId: 2},
    { id: 3, name: "Romeo and Juliet", authorId: 3},
    { id: 4, name: "Moby Dick", authorId: 4},
    { id: 5, name: "Life Of Pi", authorId: 5},
];


const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "Author Type",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: { 
            type: GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id )
            }
        },
    })
});

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "Book Type",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => book.authorId === author.id);
            }
        }
    })
});



const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: "A single book",
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return books.find(book => book.id === args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            description: "List of all Books",
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: "A single author",
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return authors.find(author => author.id === args.id)
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of all Authors",
            resolve: () => authors
        }
    })
});



const schema = new GraphQLSchema({
    query: RootQueryType
});

app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true
}));

app.listen(5000, () => console.log("Server is running"));