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
    GoogleMaps.ready("map", function(map) {
      google.maps.event.addListener(map.instance, "click", function(event) {
        var pin = new google.maps.LatLng(
          event.latLng.lat(), event.latLng.lng());
        var marker = new google.maps.Marker({
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: pin,
          map: map.instance
        })
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

      AllEvents.insert(data, function(err) {
        if (err) {
          console.log(err)
        }
      })

    }, 

    "click .btn.btn-danger.btn-small": function() {
        console.log('x clicked');
        Session.set('map', true);
    }
  });
}
