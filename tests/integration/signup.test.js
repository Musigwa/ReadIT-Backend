import chaiHttp from "chai-http";
import chai, { expect, should } from "chai";
import models from "../../models";
import app from "../../index";
import { users } from "../helpers/testData";

const { dummyUser } = users;
chai.use(chaiHttp);
should();

describe("SignUp", () => {
  after(async () => {
    await models.Follower.destroy({
      where: {},
      truncate: true,
      cascade: true
    });
    await models.User.destroy({
      where: {},
      truncate: true,
      cascade: true
    });
  });
  it("should register user with correct details", async () => {
    const response = await chai
      .request(app)
      .post("/api/v1/users")
      .send({ ...dummyUser });
    expect(response.status).eql(201);
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("message");
    expect(response.body.message).to.be.equals("User registered successfully");
    expect(response.body.user).to.be.an("object");
    expect(Object.keys(response.body.user)).to.include.members([
      "id",
      "email",
      "username"
    ]);
  });
  it("should fail if one of email, firstName, lastName, or password is empty", async () => {
    const response = await chai
      .request(app)
      .post("/api/v1/users")
      .send({ email: "", password: "", username: "" });
    expect(response.status).eql(400);
    expect(response.body.message).eql("User registration failed");
    expect(response.body.errors).to.deep.equal({
      username: "Username is required",
      email: "Email is required",
      password: "Password is required"
    });
  });
  it("should fail if user provide invalid email", async () => {
    const response = await chai
      .request(app)
      .post("/api/v1/users")
      .send({
        ...dummyUser,
        email: "luc@@gmail.com.com"
      });
    expect(response.status).eql(400);
    expect(response.body.message).to.be.equal("Invalid email");
  });
  it("should fail if email already exist", async () => {
    const response = await chai
      .request(app)
      .post("/api/v1/users")
      .send({
        email: "luc.bayo@gmail.com",
        password: "aabayo7876865",
        username: "jean786"
      });
    expect(response.status).equal(409);
    expect(response.body).to.be.an("object");
    expect(response.body.message).eql("The email is already taken");
  });
  it("should fail if provided password is less than 8 characters", async () => {
    const response = await chai
      .request(app)
      .post("/api/v1/users")
      .send({
        email: "luc.bayo@gmail.com",
        password: "avjlk",
        username: "jean786"
      });
    expect(response.status).equal(400);
    expect(response.body).to.be.an("object");
    expect(response.body.message).eql(
      "The password should be an alphanumeric with at least 8 characters"
    );
  });
  it("should fail if provided username is not an alphanumeric character", async () => {
    const response = await chai
      .request(app)
      .post("/api/v1/users")
      .send({
        email: "luc.bayo@gmail.com",
        password: "password",
        username: "7aba^>"
      });
    expect(response.status).equal(409);
    expect(response.body).to.be.an("object");
    expect(response.body.message).eql(
      "The username must begin with letter and only contains alphabet and numbers not symbols"
    );
  });
  it("should fail if username already exist", async () => {
    const response = await chai
      .request(app)
      .post("/api/v1/users")
      .send({
        ...dummyUser,
        email: "jean@andela.com"
      });
    expect(response.status).equal(409);
    expect(response.body).to.be.an("object");
    expect(response.body.message).eql("The username is already taken");
  });
});