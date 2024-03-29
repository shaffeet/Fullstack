const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

describe("when there is initially some blogs saved", () => {
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
});

describe("addition of a new blog", () => {
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
});

describe("deletion of a blog", () => {
  test("succeeds with a status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const ids = blogsAtEnd.map((blog) => blog.id);
    expect(ids).not.toContain(blogToDelete.id);
  });
});

describe("modifying a blog", () => {
  test("updating a blog works", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1,
    };

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toEqual(updatedBlog);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    expect(blogsAtEnd).toContainEqual(updatedBlog);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
