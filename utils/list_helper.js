const _ = require('lodash');

const dummy = (array) => {
  return 1;
};

const totalLikes = (array) => {
    const reducer = (sum, item) => {
        return sum + item.likes
    }

    return array.length === 0 ? 0 : array.reduce(reducer, 0)
}

const favoriteBlog = (array) => {
    if(array.length === 0 ) return 0

    return mostLiked = array.reduce((max, item) => {
        return item.likes > max.likes ? item : max
    })
}

const mostBlogs = (array) => {
    const groupedByAuthor = _.groupBy(array, 'author')
    let topAuthor = null
    let maxNumberOfBlogs = 0 
    for (const author in groupedByAuthor) {
        console.log(author)
        const totalBlogs = groupedByAuthor[author].reduce((sum, blog) => {
            sum + blog.likes
        }, 0)

        if(totalBlogs > maxNumberOfBlogs) {
            maxNumberOfBlogs = totalBlogs
            topAuthor = author
        }
    }

    return({author: topAuthor, blogs: maxNumberOfBlogs})
}

const mostLikes = (array) => {
    const grouped = _.groupBy(array, 'author')
    return grouped
}

module.exports = { dummy, totalLikes, favoriteBlog, mostLikes, mostBlogs };
