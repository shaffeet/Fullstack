const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes;
  };
  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return 0;
  }

  const favorite = blogs.reduce((previous, current) =>
    previous.likes > current.likes ? previous : current
  );

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {
      author: null,
      blogs: 0,
    };
  }

  const authors = blogs.map((blog) => blog.author);
  const blogCount = _.countBy(authors);
  const authorWithMostBlogs = _.maxBy(
    Object.keys(blogCount),
    (author) => blogCount[author]
  );
  const amountOfBlogs = blogCount[authorWithMostBlogs];

  return {
    author: authorWithMostBlogs,
    blogs: amountOfBlogs,
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return {
      author: null,
      likes: 0,
    };
  }

  const likeCount = _(blogs)
    .groupBy("author")
    .mapValues((authorBlogs) => _.sumBy(authorBlogs, "likes"))
    .value();

  const [author, likes] = _.maxBy(
    _.toPairs(likeCount),
    ([author, likes]) => likes
  );

  return {
    author: author,
    likes: likes,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
