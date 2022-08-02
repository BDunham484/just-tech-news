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