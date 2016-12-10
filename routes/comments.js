var express = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// COMMENTS NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

// COMMENTS CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
    // lookup campground using ID
    Campground.findById(req.params.id, function(err, campground){
       if (err) {
           console.log(err);
           res.redirect("/campgrounds");
       } else {
          Comment.create(req.body.comment, function(err, comment){
             if (err) {
                 req.flash("error", "Something went wrong");
                 console.log(err);
             } else {
                 //  add username and id to comment
                 comment.author.id = req.user._id;
                 comment.author.username = req.user.username;
                 // save comment
                 comment.save();
                 campground.comments.push(comment);
                 campground.save();
                 req.flash("success", "Successfully added comment");
                 res.redirect("/campgrounds/" + campground._id);
             }
          });
       }
    });
});

// COMMENTS EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if (err) {
            console.log(err);
        } else {
            res.render("comments/edit", {comment: foundComment, campground_id: req.params.id});
        }
    });
});

// COMMENTS UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // find & update the correct comment
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedCampground){
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            // redirect somewhere (show page)
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// COMMENTS DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;