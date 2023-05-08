const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(helper.initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(helper.initialBlogs[1]);
  await blogObject.save();
});

test("right amount of JSON format blogs", async () => {
  const response = await api.get("/api/blogs");
  expect(response.status).toBe(200);
  expect(response.type).toBe("application/json");
  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("verifying ids", async () => {
  const response = await api.get("/api/blogs");
  const id = response.body.map((r) => r.id);
  expect(id).toBeDefined();
});

test("valid blog can be added", async () => {
  const newBlog = {
    title: "New Title",
    author: "New Author",
    url: "http://www.new.com",
    likes: 10,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
});

afterAll(async () => {
  await mongoose.connection.close();
});
