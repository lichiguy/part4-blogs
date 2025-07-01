const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const bcrypt = require("bcrypt");

const helper = require("./test_helper");

const User = require("../models/user");
const Blog = require("../models/blog");

describe("When there is initially some blogs", () => {
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

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response._body.length, helper.initialBlogs.length);
  });

  test("a specific blog is within the returned blogs", async () => {
    const response = await api.get("/api/blogs");

    const titles = response._body.map((e) => e.title);
    assert(titles.includes("React patterns"));
  });
});

describe("Viewing a specific blog", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("succeeds with a valid id", async () => {
    const blogsAtStart = await helper.blogsInDb();

    const blogToView = blogsAtStart[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert.deepStrictEqual(resultBlog.body, blogToView);
  });

  test("fails with statuscode 404 if blog does not exist", async () => {
    const validNonExistingId = await helper.nonExistingId();

    await api.get(`/api/blogs/${validNonExistingId}`).expect(404);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "685f3098185";

    await api.get(`/api/notes/${invalidId}`).expect(404);
  });
});

describe("Addition of a new blog", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("succeeds with valid data", async () => {
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
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

    const titles = blogsAtEnd.map((n) => n.title);
    assert(titles.includes("Canonical string reduction"));
  });

  test("blog without likes is added with 0 likes", async () => {
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    };

    await api.post("/api/blogs").send(newBlog).expect(201);
    const blogsAtEnd = await helper.blogsInDb();

    const titles = blogsAtEnd.map((blog) => blog.title);
    assert(titles.includes(newBlog.title));

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    assert(blogsAtEnd[blogsAtEnd.length - 1].likes === 0);
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

describe("Deletion of a blog", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
    const blogsAtEnd = await helper.blogsInDb();

    const titles = blogsAtEnd.map((r) => r.title);
    assert(!titles.includes(blogToDelete.title));

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
  });
});

describe("Other tests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("the identificator is id", async () => {
    const blogs = await helper.blogsInDb();
    const identificators = blogs.map((blog) => blog.id);
    assert(identificators);
  });
});

describe("Edition of a blog", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("succeeds with valid id", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const newBlog = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: 100,
    };

    await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog);

    const blogsAtEnd = await helper.blogsInDb();

    const likes = blogsAtEnd.map((blog) => blog.likes);
    assert(likes.includes(100));

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
  });
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
