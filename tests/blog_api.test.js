const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const assert = require("node:assert");
const app = require("../app");
const helper = require("./test_helper");
const api = supertest(app);

const Blog = require("../models/blog");

describe("Reference Tests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("there are two blogs", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response._body.length, helper.initialBlogs.length);
  });

  test("the first blog is about react", async () => {
    const response = await api.get("/api/blogs");

    const contents = response._body.map((e) => e.title);
    assert(contents.includes("React patterns"));
  });

  test("a specific blog can be viewed", async () => {
    const blogsAtStart = await helper.blogsInDb();

    const blogToView = blogsAtStart[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert.deepStrictEqual(resultBlog.body, blogToView);
  });

  test("a blog can be deleted", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
    const blogsAtEnd = await helper.blogsInDb();

    const contents = blogsAtEnd.map((r) => r.title);
    assert(!contents.includes(blogToDelete.title));

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
  });
});

describe("Excercises test", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("the identificator is id", async () => {
    const blogs = await helper.blogsInDb();
    const identificators = blogs.map((blog) => blog.id);
    assert(identificators);
  });

  test("a valid blog can be added ", async () => {
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    const contents = blogsAtEnd.map((n) => n.title);

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

    assert(contents.includes("Canonical string reduction"));
  });

  test("blog without likes is added with 0 likes", async () => {
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    };

    await api.post("/api/blogs").send(newBlog).expect(201);

    const blogsAtEnd = await helper.blogsInDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    assert(blogsAtEnd[helper.initialBlogs.length].likes === 0);
  });

  test("blog without title or url is not added", async () => {
    const blogWithNoAuthor = {
      title: "Canonical string reduction",  
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    };

    await api.post("/api/blogs").send(blogWithNoAuthor).expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);

    const blogWithNoUrl = {
      title: "Canonical string reduction",  
      author: "Edsger W. Dijkstra",
      likes: 12,
    };

    await api.post("/api/blogs").send(blogWithNoUrl).expect(400);

    const blogsAtEndT = await helper.blogsInDb();
    assert.strictEqual(blogsAtEndT.length, helper.initialBlogs.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
