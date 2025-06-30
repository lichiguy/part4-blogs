const _ = require("lodash");

const dummy = (array) => {
  return 1;
};

const totalLikes = (array) => {
  const reducer = (sum, item) => {
    return sum + item.likes;
  };

  return array.length === 0 ? 0 : array.reduce(reducer, 0);
};

const favoriteBlog = (array) => {
  if (array.length === 0) return 0;

  return (mostLiked = array.reduce((max, item) => {
    return item.likes > max.likes ? item : max;
  }));
};

const mostBlogs = (array) => {
  if (array.length === 0) return 0;
  const groupedByAuthor = _.groupBy(array, "author");
  let topAuthor = null;
  let maxNumberOfBlogs = 0;
  for (const author in groupedByAuthor) {
    const totalBlogs = groupedByAuthor[author].reduce((sum, blog) => {
      return sum + 1;
    }, 0);

    if (totalBlogs > maxNumberOfBlogs) {
      maxNumberOfBlogs = totalBlogs;
      topAuthor = author;
    }
  }

  return {
    author: topAuthor,
    blogs: maxNumberOfBlogs,
  };
};

const mostLikes = (array) => {
  if (array.length === 0) return 0;
  const groupedByAuthor = _.groupBy(array, "author");
  let topAuthor = null;
  let maxLikes = 0;
  for (const author in groupedByAuthor) {
    const totalLikes = groupedByAuthor[author].reduce((sum, blog) => {
      return sum + blog.likes;
    }, 0);

    if (totalLikes > maxLikes) {
      maxLikes = totalLikes;
      topAuthor = author;
    }
  }

  return {
    author: topAuthor,
    likes: maxLikes,
  };
};

module.exports = { dummy, totalLikes, favoriteBlog, mostLikes, mostBlogs };
