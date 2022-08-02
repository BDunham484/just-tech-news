const router = require('express').Router();
const sequelize = require('../config/connection')
const { Post, User, Comment } = require('../models');

router.get('/', (req, res) => {
    console.log(req.session);
    Post.findAll({
        //query configuration
        attributes: ['id', 'post_url', 'title', 'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
        order: [['created_at', 'DESC']],
        include: [
            {
                model: User,
                attributes: ['username']
            }
        ],
        include: [
            //inclued the comment model here
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                inclued: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attrubutes: ['username']
            }
        ]
    })
        .then(dbPostData => {
            // console.log(dbPostData[0].get({plain: true}));
            //pass a single post object into the homepage template
            const posts = dbPostData.map(post => post.get({ plain: true }));
            res.render('homepage', { 
                posts,
                loggedIn: req.session.loggedIn
            });
        })
        .catch(err => {
            console.log(err);
            req.statusCode(500).json(err);
        });
});

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }
    res.render('login');
})

router.get('/post/:id', (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['id', 'post_url', 'title', 'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
        include: [
            //inclued the comment model here
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                inclued: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User, 
                attrubutes: ['username']
            }
        ]
    })
    .then(dbPostData => {
        if (!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        //serialize the data
        const post = dbPostData.get({ plain: true});
        //pass data to templat
        res.render('single-post', { 
            post,
            loggedIn: req.session.loggedIn
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;