if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Markers = new Mongo.Collection("markers");
    AllEvents = new Mongo.Collection("form");
  });
}
