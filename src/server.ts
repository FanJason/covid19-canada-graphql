import express from 'express';
import graphqlHTTP from 'express-graphql';
import graphql from 'graphql';
import getData from './database.js';

const dataType = new graphql.GraphQLObjectType({
    name: 'Data',
    fields: {
        id: { type: graphql.GraphQLInt },
        dateLastUpdated: { type: graphql.GraphQLString },
        discoveryDate: { type: graphql.GraphQLString },
        gender: { type: graphql.GraphQLString },
        ageGroup: { type: graphql.GraphQLString },
        transmission: { type: graphql.GraphQLString },
        hospitalization: { type: graphql.GraphQLString },
        ICU: { type: graphql.GraphQLString },
        status: { type: graphql.GraphQLString },
    }
});

const queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    data: {
        type: dataType,
        args: {},
        resolve: async () => {
          getData().then((data: any) => {
            console.log(data.rows[0]);
            return data.rows[0];
          });
        }
    },
  }
});

const schema = new graphql.GraphQLSchema({ query: queryType });

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');