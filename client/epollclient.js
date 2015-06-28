AllEvents = new Mongo.Collection("form");

if (Meteor.isClient) {

  var encodeBase64 = function(file, callback) {
    var reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
    } else {
      console.error("There was an issue encoding the image!");
    }

    reader.onloadend = function() {
      callback(reader.result);
    }
  }

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
        }, function(error, id) {
          if (!error) {
            Session.set('map', false);
            Session.set('sessionMarker', id);
          }
        });
      });

      AllEvents.find().observe({
        /*
        * When a Marker element is added to the Collection, create
        * a Marker DOM obect for it using the Google Maps API and
        * add a listener so that it can be updated when it is moved.
        * Then add it to an object literal that will keep track of the
        * Marker elements that we have on the front-end.
        */
        added: function(document) {
          console.log(document);
          var markerObject = Markers.findOne({"_id": document.markerRef})
          var pin = new google.maps.LatLng(markerObject.lat, markerObject.lng);
          var infoContent = "<div id='content'>" +
          '<h1>' + document.name + '</h1><br/>' +
          '<p>' + document.description + '</p>' + 
          '<img width = "50%" src="' + document.image + '"/>' ;

          if (document.time == "Come Now") {
            infoContent += "<p> You should come to this event now!</p>";
          } else if (document.time == "Come Soon") {
            infoContent += "<p> You should come to this event soon!</p>";
          } else {
            infoContent += "<p> You should come to this event someime today!</p>";
          }

          var infoWindow = new google.maps.InfoWindow({
            content: infoContent
          });

          var marker = new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: pin,
            map: map.instance,
            id: document.markerRef._id
          });

          google.maps.event.addListener(marker, "dragend", function(event) {
            Markers.update(marker.id, {
              $set: {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              }
            });
          });

          google.maps.event.addListener(marker, "click", function(event) {
            infoWindow.open(map.instance, marker);
          });
          markers[document._id] = marker;
        }
      });

      Markers.find().observe({
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

  var imgURL;
  Template.form.events({
    "change #photo-upload": function(event, template) {
      var file = event.currentTarget.files[0];
      console.log(file);
      var key = "735346c90a8ab2a";
      encodeBase64(file, function(img) {
      console.log("img: " + img);

      Imgur.upload({apiKey: key, image: img}, function(error, data) { 
        if (error) {
          console.log(error);
        } else {
          imgURL = data.link;
          console.log(imgURL)
        }
      });

      if ($("#photo-upload").val() != "") {
        $("span#no-photo").addClass("hidden");
        $("span#has-photo").removeClass("hidden");
      } else {
        $("span#has-photo").addClass("hidden");
        $("span#no-photo").removeClass("hidden");
      }
      })
    },

    "submit form": function(event, template) {
      event.preventDefault();
      var data = {
        name: $("input#name").val(),
        description: $("textarea#description").val(),
        time: $("select#time").val(),
        submitted_at: new Date(),
        image: imgURL,
        markerRef: Session.get("sessionMarker")
      };

      console.log(data);

      AllEvents.insert(data, function(err) {
        if (err) {
          console.log(err)
        }
      });

      Session.set('map', true);
    },

    "click .js-close": function() {
      console.log('x clicked');
      Session.set('map', true);
    }
  });
}

