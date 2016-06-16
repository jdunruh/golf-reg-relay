// Import the required libraries
var graphql = require('graphql');
var graphqlHTTP = require('express-graphql');
var express = require('express');

// Import the data you created above
var data = require('./data.json');

var nextId = 9; // next unique ID. The data file goes up to 8.

function genId() {
    return nextId++;
}

function objToArray(obj) {
    return Object.keys(obj).map((key) => {return obj[key]})
}

function getPeople(entity) {
    return entity.map((id) => data.players[id])
}

function getOrgs(entity) {
    return entity.organizations.map(id => data.organizations[id])
}

function getTimes(event) {
    return event.startTimes.map(time => data.startTimes[time])
}

function newTime(id, input) {
    data.startTimes[id] = {};
    data.startTimes[id].id = id;
    data.startTimes[id].time = input.time;
    data.startTimes[id].capacity = input.capacity;
    if (input.comment) {
        data.startTimes[id].comment = input.comment;
    }
    return data.startTimes[id];
}

var personInterface = new graphql.GraphQLInterfaceType({
    name: 'personInterface',
    description: 'characteristics of a person',
    fields: {
        id: { type: graphql.GraphQLString,
        description: 'The ID of a Person'},
        lastName: { type: graphql.GraphQLString,
        description: 'Last Name'},
        firstName: { type: graphql.GraphQLString,
        description: 'First Name'},
        email: { type: graphql.GraphQLString,
        description: 'email address'}
    },
    resolveType: function() { return personType }
});

var organizationType = new graphql.GraphQLObjectType({
    name: 'Organization',
    fields: {
        id: { type: graphql.GraphQLString },
        name: { type: graphql.GraphQLString,
        description: 'Organization Name'},
        organizers: { type: new graphql.GraphQLList(personInterface),
        description: 'List of organizers who can add or delete events',
        resolve: people => getPeople(people.organizers)},
        members: { type: new graphql.GraphQLList(personInterface),
        description: 'List of members of the organization',
        resolve: people => getPeople(people.members)}
    }
});

var personType = new graphql.GraphQLObjectType({
    name: 'Person',
    description: 'Organizers and Participants',
    fields: {
        id: { type: graphql.GraphQLString },
        lastName: { type: graphql.GraphQLString },
        firstName: { type: graphql.GraphQLString },
        email: { type: graphql.GraphQLString,
        description: 'email address'},
        organizations: {type: new graphql.GraphQLList(organizationType),
        description: 'List of organizations to which this person belongs',
        resolve: orgIDs => getOrgs(orgIDs)},
        organizes: {type: new graphql.GraphQLList(organizationType),
        description: 'List of organizations for which this person organizes',
        resolve: orgIDs => getOrgs(orgIDs)}
    },
    interfaces: [ personInterface ] 
});

var startTimeType = new graphql.GraphQLObjectType({
    name: 'startTime',
    fields: {
        id: { type: graphql.GraphQLString },
        time: { type: graphql.GraphQLString,
        description: 'The starting time for this group'},
        capacity: { type: graphql.GraphQLInt,
        description: 'The maximum number of people allowed in this group'},
        comment: { type: graphql.GraphQLString,
        description: 'text comment to be displayed about this group'},
        participants: { type: new graphql.GraphQLList(personType),
        description: 'List of people participating at this time',
        resolve: people => getPeople(people.participants)}
    }
});


var eventType = new graphql.GraphQLObjectType({
        name: 'Event',
        fields: {
            id: {type: graphql.GraphQLString},
            name: {
                type: graphql.GraphQLString,
                description: 'The name of the event'
            },
            comment: {
                type: graphql.GraphQLString,
                description: 'Text comment to be displayed about this event'
            },
            date: {
                type: graphql.GraphQLString,
                description: 'date of this event'
            },
            location: {
                type: graphql.GraphQLString,
                description: 'name of event location (for example Fossil Trace Golf Course'
            },
            address: {
                type: graphql.GraphQLString,
                description: 'First line of event location address'
            },
            address2: {
                type: graphql.GraphQLString,
                description: 'Second line of event location address (if any)'
            },
            city: {
                type: graphql.GraphQLString,
                description: 'Event location city'
            },
            state: {
                type: graphql.GraphQLString,
                description: 'Event location state'
            },
            zip: {
                type: graphql.GraphQLString,
                description: 'Event location Zip (Postal) code'
            },
            organizers: {
                type: new graphql.GraphQLList(personType),
                description: 'List of organizers for this event',
                resolve: people => getPeople(people.organizers)
            },
            organizations: {
                type: new graphql.GraphQLList(organizationType),
                description: 'List of organizations involved with this event',
                resolve: orgIDs => getOrgs(orgIDs)
            },
            startTimes: {
                type: new graphql.GraphQLList(startTimeType),
                description: 'List ofparticipant groups and their starting times for this event',
                resolve: times =>getTimes(times)
            }
        }
    });

// input types for mutations. Relay needs all the args bundled into a single input for each mutation.

startTimeInputType = new graphql.GraphQLInputObjectType({
    name: 'startTimeInput',
    fields: {
        time: {
            type: graphql.GraphQLString,
            description: 'Group start time as as string'
        },
        capacity: {
            type: graphql.GraphQLInt,
            description: 'the number of people allowed at the start time'
        },
        comment: {
            type: graphql.GraphQLString,
            description: 'comment associated with the start time'
        }
    }
});

var addNewTimeToEventInputType = new graphql.GraphQLInputObjectType({
    name: 'addNewTimeToEventInput',
    fields: {
        eventId: {
            type: graphql.GraphQLString,
            description: 'ID of the event to which this start time will be added'
        },
        time: {
            type: graphql.GraphQLString,
            description: 'Group start time as as string'
        },
        capacity: {
            type: graphql.GraphQLInt,
            description: 'the number of people allowed at the start time'
        },
        comment: {
            type: graphql.GraphQLString,
            description: 'comment associated with the start time'
        }
    }
});

// Define the schema with one top-level field, `user`, that
// takes an `id` argument and returns the User with that ID.
// Note that the `query` is a GraphQLObjectType, just like User.
// The `user` field, however, is a userType, which we defined above.
var schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: 'Query',
        fields: {
            player: {
                type: personType,
                args: {
                    id: { type: graphql.GraphQLString }
                },
                resolve: function(_, args) {
                    return data.players[args.id];
                }
            },
            players: {
                type: new graphql.GraphQLList(personType),
                resolve: function(_, _) {
                    return objToArray(data.players)
                }
            },

            organization: {
                type: organizationType,
                args: {
                    id: { type: graphql.GraphQLString }
                },
                resolve: function(_, args) {
                    return data.organizations[args.id];
                }
            },
            organizations: {
                type: new graphql.GraphQLList(organizationType),
                resolve: function(_, _) {
                    return objToArray(data.organizations)
                }
            },
            event: {
                type: eventType,
                args: {
                    id: { type: graphql.GraphQLString }
                },
                resolve: function(_, args) {
                    return data.events[args.id];
                }
            },
            events: {
                type: new graphql.GraphQLList(eventType),
                resolve: function(_, _) {
                    return objToArray(data.events)
                }
            },
            startTime: {
                type: startTimeType,
                args: {
                    id: { type: graphql.GraphQLString }
                },
                resolve: function(_, args) {
                    return data.startTimes[args.id];
                }
            },
            startTimes: {
                type: new graphql.GraphQLList(startTimeType),
                resolve: function(_, _) {
                    return objToArray(data.startTimes)
                }
            }

        }
    }),
    mutation: new graphql.GraphQLObjectType({
        name: 'Mutation',
        fields: {
            newStartTime: {
                type: startTimeType,
                args: {
                    input: {
                        type: startTimeInputType,
                        description: 'the data for a new start time as an object of tipe startTimeInputType'
                    }
                },
                resolve: function(_, {input}) {
                    var newId = genId();
                    newTime(id, input);
                    console.log("finished mutating data");
                    return data.startTimes[newId];
                }
            },
            addNewTimeToEvent: {
                type: startTimeType,
                args: {
                    input: {
                        type: addNewTimeToEventInputType,
                        description: 'input containing data for a new start time and the ID of the event te which it is to be added'
                    }
                },
                resolve: function(_, {input}) {
                    var newId = genId();
                    var time = newTime(newId, input);
                    data.events[input.eventId].startTimes.push(newId);
                    return time;
                }
            }


        }
    })
});

express()
    .use('/graphql', graphqlHTTP({ schema: schema, pretty: true, graphiql: true}))
    .listen(3000);

console.log('GraphQL server running on http://localhost:3000/graphql');
