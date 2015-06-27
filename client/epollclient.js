AllEvents = new Mongo.Collection("form");

if (Meteor.isClient) {
  Session.setDefault('map', true);

  UI.body.helpers({
      showMap: function(){
          return Session.get('map');
      }
  });

  Meteor.startup(function(){
    $.material.init()
    GoogleMaps.load();
  });

  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Markers = new Mongo.Collection("markers");

  Template.map.helpers({
    mapOptions: function() {
      if (GoogleMaps.loaded() && navigator.geolocation) {
        return {
          center: new google.maps.LatLng(37.777220,-122.391285),
          zoom: 18
        };
      }
    }
  });

  Template.map.events({
    'click .add': function(){
      console.log("You clicked something");
      Session.set('map', false);
    }
  });

  Template.map.onCreated(function() {
    var markers = {};

    GoogleMaps.ready("map", function(map) {
      google.maps.event.addListener(map.instance, "click", function(event) {
        console.log(event);
        // Insert location where the pin was dropped into the Markers collection
        Markers.insert({
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        });
      });

      Markers.find().observe({
        /*
        * When a Marker element is added to the Collection, create
        * a Marker DOM obect for it using the Google Maps API and
        * add a listener so that it can be updated when it is moved.
        * Then add it to an object literal that will keep track of the
        * Marker elements that we have on the front-end.
        */
        added: function(document) {
          var pin = new google.maps.LatLng(document.lat, document.lng);
          var marker = new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: pin,
            map: map.instance,
            id: document._id
          });

          google.maps.event.addListener(marker, "dragend", function(event) {
            Markers.update(marker.id, {
              $set: {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              }
            });
          });
          markers[document._id] = marker;
        },

        /*
        * When a Marker element is updated in the collection, get the corresponding
        * DOM element in the front-end and change its position.
        */
        changed: function(old, new_) {
          markers[new_._id].setPosition({
            lat: new_.lat,
            lng: new_.lng
          });
        },

        /*
        * When a Marker element is deleted, remove all instances of it and remove
        * its listener.
        */
        removed: function(old) {
          markers[old._id].setMap(null);
          google.maps.event.clearInstanceListeners(markers[old._id]);
          delete markers[old._id];
        }
      });
    });
  });

  Template.form.events({
    "change #photo-upload": function(event, template) {
      if ($("#photo-upload").val() != "") {
        $("span#no-photo").addClass("hidden");
        $("span#has-photo").removeClass("hidden");
      } else {
        $("span#has-photo").addClass("hidden");
        $("span#no-photo").removeClass("hidden");
      }
    },

    "submit form": function(event, template) {
      event.preventDefault();
      var data = {
        name: $("input#name").val(),
        description: $("textarea#description").val(),
        time: $("select#time").val(),
        submitted_at: new Date()
      };

      console.log(data);

      AllEvents.insert(data, function(err) {
        if (err) {
          console.log(err)
        }
      });
    },

    "click .close": function() {
        console.log('x clicked');
        Session.set('map', true);
    }
  });
}
