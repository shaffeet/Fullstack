const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
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

test("if likes has no value, make it 0", async () => {
  const newBlog = {
    title: "New Title",
    author: "New Author",
    url: "http://www.new.com",
  };

  const response = await api.post("/api/blogs").send(newBlog).expect(201);

  expect(response.body.likes).toBe(0);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
});

test("if title or url undefined, give 400 Bad Request", async () => {
  const newBlog = {
    author: "New Author",
    likes: 100,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

afterAll(async () => {
  await mongoose.connection.close();
});
