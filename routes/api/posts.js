const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Post Model
const Post = require('../../models/Post')

// Profile Model
const Profile = require('../../models/Profile')

// Validation
const validatePostInput = require('../../validation/posts')

// @route     GET api/posts/test
// @desc      Tests post route
// @access    Public
router.get('/test', (req, res) => res.json({
  msg: 'Posts works'
}))


// @route     GET api/posts/
// @desc      GET posts
// @access    Public
router.get('/', (req, res) => {
  Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostfound: 'No post found'}))
})

// @route     GET api/posts/:id
// @desc      GET posts
// @access    Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostfound: 'No post found with that ID'}))
})

// @route     POST api/posts
// @desc      Create post
// @access    Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body)

  if(!isValid){
    return res.status(400).json(errors)
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  })

  newPost.save().then(post => res.json(post))
})

// @route     DELETE api/posts/:id
// @desc      delete post
// @access    Private
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post onwer
          if(post.user.toString() !== req.user.id) {
            return res.status(401).json({noauthorized: 'User not authorized'})
          }

          //delete
          post.remove().then(() => res.json({success: true}))
        })
        .catch(err => res.status(404).json({postnotfound: 'No post found'}))
    })
})
module.exports = router