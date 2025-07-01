const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const bcrypt = require("bcrypt");

const helper = require("./test_helper");

const User = require("../models/user");

const userWithoutUsername = {
  user: "testingUser",
  password: "testingPassword",
};

const userWithoutPassword = {
  username: "testtingUsername",
  user: "testingUsername",
};

const userWithInvalidPassword = {
  username: "testtingUsername",
  user: "testingUsername",
  password: "id",
};

const userWithInvalidUser = {
  username: "us",
  user: "testingUsername",
  password: "testingPassword",
};

describe("Create user does not work", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("testingPass", 10);
    const user = new User({
      username: "tesing",
      name: "testingName",
      passwordHash,
    });

    await user.save();
  });

  test("when there is no username", async () => {
    const result = await api
      .post("/api/users")
      .send(userWithoutUsername)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    assert(result._body.error.includes("Path `username` is required"));
  });

  test("when there is no password", async () => {
    const result = await api
      .post("/api/users")
      .send(userWithoutPassword)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    assert(result._body.error.includes("password is required"));
  });

  test("when the username is invalid", async () => {
    const result = await api
      .post("/api/users")
      .send(userWithInvalidUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    assert(
      result._body.error.includes(
        "Path `username` (`us`) is shorter than the minimum allowed length (3)"
      )
    );
  });

  test("when the password is invalid", async () => {
    const result = await api
      .post("/api/users")
      .send(userWithInvalidPassword)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    assert(
      result._body.error.includes("password must have at least 3 characters")
    );
  });

  test("when the user is not unique", async () => {
    const passwordHash = await bcrypt.hash("testingPass", 10);
    const repeatedUser = {
      username: "tesing",
      name: "testingName",
      password: passwordHash,
    };
    const result = await api
      .post("/api/users")
      .send(repeatedUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    assert(result._body.error.includes("expected `username` to be unique"));
  });
});

after(async () => {
  await mongoose.connection.close();
});
