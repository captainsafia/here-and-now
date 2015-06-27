if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Markers = new Mongo.Collection("markers");
    AllEvents = new Mongo.Collection("form");

    Meteor.publish("markers", function() {
    	return Markers.find();
	});

    Meteor.publish("form", function() {
    	return AllEvents.find();
	});

  });
}
