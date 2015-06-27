if (Meteor.isServer) {
  Meteor.startup(function () {
    AllEvents = new Mongo.Collection("form");
  });
}
