var idFromPathSegment = function(pathSegment) { // everything after last dash
  return pathSegment.substring(pathSegment.lastIndexOf('-') + 1);
};

Router.route("home", {
  path: "/",
  template: "home",
  onRun: function() {
    $('html, body').scrollTop(0);
    return this.next();
  },
  waitOn: function() {
    return this.subscribe('exploreStoriesPub', '', '', '').wait();
  },
  action: function() {
    if (this.ready()) {
      return this.render();
    }
  },
  data: function() {}
});

Router.route("about", {
  path: "about",
  template: "about",
  onRun: function() {
    $('html, body').scrollTop(0);
    return this.next();
  },
  action: function() {
    if (this.ready()) {
      return this.render();
    }
  },
  data: function() {}
});

Router.route("terms", {
  path: "terms",
  template: "terms",
  onRun: function() {
    $('html, body').scrollTop(0);
    return this.next();
  },
  action: function() {
    if (this.ready()) {
      return this.render();
    }
  },
  data: function() {}
});

Router.route("profile", {
  path: "profile",
  template: "profile",
  waitOn: function() {
    return [Meteor.subscribe('ownStoriesPub')];
  },
  onBeforeAction: function() {
    var user;
    if ((user = Meteor.user()) || Meteor.loggingIn()) {
      return this.next();
    } else {
      this.redirect("home", {
        replaceState: true
      });
      return alert("You must be logged in view your profile");
    }
  }
});

Router.route("my_stories", {
  path: "my-stories",
  template: "my_stories",
  waitOn: function() {
    return [Meteor.subscribe('ownStoriesPub')];
  },
  onBeforeAction: function() {
    var user;
    if ((user = Meteor.user()) || Meteor.loggingIn()) {
      //if (user) {
      //  this.subscribe('readStoriesPub', user.profile.favorites);
      //}
      return this.next();
    } else {
      this.redirect("home", {
        replaceState: true
      });
      return alert("You must be logged in view your profile");
    }
  }
});

Router.route("read", {
  path: "read/:userPathSegment/:storyPathSegment",
  template: "read",
  waitOn: function() {
    shortId = idFromPathSegment(this.params.storyPathSegment);
    return [Meteor.subscribe('readStoryPub', this.params.userPathSegment, shortId)];
  },
  action: function() {
    if (this.ready()) {
      return this.render();
    }
  },
  data: function() {
    var story;
    story = Stories.findOne({}, {reactive: false});
    if (story) {
      Session.set("story", story);
      Session.set("storyId", story._id);
      Session.set("headerImage", story.headerImage);
      Session.set("horizontalSectionsMap", _.map(_.pluck(story.verticalSections, "contextBlocks"), function(cBlocks, i) {
        return {
          verticalIndex: i,
          horizontal: _.map(_.pluck(cBlocks, '_id'), function(id, i) {
            return {
              _id: id,
              horizontalIndex: i
            }
          })
        };
      }));
      return story;
    }
  },
  onBeforeAction: function() {
    Session.set("currentY", null);
    Session.set("newStory", false);
    Session.set("read", true);
    Session.set("showDraft", false);
    return this.next();
  }
});


Router.route("edit", {
  path: "create/:userPathSegment/:storyPathSegment",
  template: "create",
  onRun: function() {
    Session.set("currentY", null);

    Session.set("userPathSegment", this.params.userPathSegment);
    $('html, body').scrollTop(0);
    return this.next();
  },
  waitOn: function() {
    shortId = idFromPathSegment(this.params.storyPathSegment);
    return [Meteor.subscribe('createStoryPub', this.params.userPathSegment, shortId), Meteor.subscribe('contextBlocksPub')];
  },
  data: function() {
    var story;
    story = Stories.findOne({shortId: idFromPathSegment(this.params.storyPathSegment)});
    if (story && story.draftStory) {
      Session.set("story", story.draftStory);
      Session.set("storyId", story._id);
      Session.set("storyPublished", story.published);
      Session.set("headerImage", story.draftStory.headerImage);
      Session.set("horizontalSectionsMap", _.map(_.pluck(story.draftStory.verticalSections, "contextBlocks"), function(cBlockIds, i) {
        return {
          verticalIndex: i,
          horizontal: _.map(cBlockIds, function(id, i) {
            return {
              _id: id,
              horizontalIndex: i
            }
          })
        };
      }));
      return story;
    }
  },
  action: function() {
    Session.set("read", false);
    Session.set("newStory", false);
    Session.set("showDraft", true);
    if (this.ready()) {
      return this.render();
    }
  },
  onBeforeAction: function() {
    var user, data;
    if ((user = Meteor.user()) || Meteor.loggingIn()) { // if there is a user
      data = this.data();
      if (user && data && user._id !== data.authorId) { // if they don't own the story redirect them to read
        this.redirect("read", data, {
          replaceState: true
        });
      }
      return this.next(); // if they do own the story, let them through to create
    } else {
      Session.set('signingIn', true); // if there is no user, take them to the signin page
      this.redirect("home", { // TO-DO, after they sign in, they should get back to the create page
        replaceState: true
      });
      return this.next();
    }
  }
});

Router.route("twitter-signup", {
  path: "twitter-signup",
  template: "signup",
  onRun: function() {
    $('html, body').scrollTop(0);
    return this.next();
  },
  waitOn: function() {
    if (Meteor.user()) {
     [Meteor.subscribe('tempUsernamePub')];
      return this.next();
    }
  },
  action: function() {
    Session.set("emailUser", false);
    Session.set('signingInWithTwitter', false);
    if (this.ready()) {
      return this.render();
    }
  }
});

Router.route("email-signup", {
  path: "email-signup",
  template: "signup",
  onRun: function() {
    $('html, body').scrollTop(0);
    return this.next();
  },
  action: function() {
    Session.set("emailUser", true);
    Session.set('signingInWithTwitter', false);
    if (this.ready()) {
      return this.render();
    }
  }
});

Router.route("login", {
  path: "login",
  template: "login",
  onRun: function() {
    $('html, body').scrollTop(0);
    return this.next();
  },
  action: function() {
    if (this.ready()) {
      return this.render();
    }
  }
});

Router.route("stats", {
  path: "stats",
  template: "stats"
});
