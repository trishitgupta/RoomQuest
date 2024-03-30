import chai from "chai";
import sinon from "sinon";
import chaiHttp from "chai-http";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import app from "../index.js";
import { login } from "../controllers/authController.js"; // Adjust the path as per your file structure
import User from "../models/User.js"; // Adjust the path as per your file structure

chai.use(chaiHttp);
const expect = chai.expect;

// describe('Testing Endpoint', () => {
//   it('should return 200 and the result of 2 + 2', (done) => {
//     chai.request(app)
//       .post('/api/auth/testsample')
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.body).to.have.property('result', 4);
//         done();
//       });
//   });
// });

describe("User LogIn Routes", () => {
  let findOneStub;
  let bcryptStub;

  beforeEach(() => {
    findOneStub = sinon.stub(User, "findOne");
    bcryptStub = sinon.stub(bcrypt, "compare");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should login a user and return a token and user details", async () => {
    const mockUser = {
      _doc: {
        _id: "mockUserId",
        email: "mock@gmail.com",
        username: "mockUser",
        password: "hashedPassword", // Use bcrypt to hash the password
        isAdmin: false, // Or whatever the isAdmin property should be
        // Add other user details as needed
      },
    };

    const token = "mock_access_token";

    findOneStub.resolves(mockUser);
    bcryptStub.resolves(true);
    sinon.stub(jwt, "sign").returns(token);

    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({ username: "mockUser", password: "hashedPassword" }); // Use the actual password for testing

    // console.log(res)
    expect(res).to.have.status(200);
    // expect(res.body).to.have.property('token');
    // Add more assertions for other user details if needed
  });

  it("should not login as user as user does not exist", async () => {
    findOneStub.resolves(null);

    chai
      .request(app)
      .post("/api/user/login")
      .send({
        username: "mock",
        password: "mockpassword",
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
      });
  });

  it("should not login as user as password is incorrect", async () => {
    const mockUser = {
      _doc: {
        _id: "mockUserId",
        email: "mock@gmail.com",
        username: "mockUser",
        password: "hashedPassword", // Use bcrypt to hash the password
        isAdmin: false, // Or whatever the isAdmin property should be
        // Add other user details as needed
      },
    };

    findOneStub.resolves(mockUser);
    bcryptStub.resolves(false);

    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({ username: "mockUser", password: "hashedPassword" }); // Use the actual password for testing

    // console.log(res)
    expect(res).to.have.status(400);
  });

  it("should give 500 when something unusual happens", async () => {});
});




describe('User Registration Route', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should create a new user and respond with a success message', async () => {
    const registerStub = sinon.stub(User.prototype, 'save').resolves();

    const res = await chai
      .request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password' });

    expect(res).to.have.status(200);
    expect(res.text).to.equal('User has been created');
    expect(registerStub.calledOnce).to.be.true;
  });

  it('should handle registration failure and respond with an error message', async () => {
    sinon.stub(User.prototype, 'save').rejects(new Error('Mock error'));

    const res = await chai
      .request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password' });

    expect(res).to.have.status(500);
   
  });
});


describe("Test cases while uploading to S3", () => {
  afterEach(() => {
    sinon.restore();
  });
 
  beforeEach(() => {
    const jwtStub = sinon.stub(jwt, "verify");
    jwtStub.callsFake((token, secret, callback) => {
      // Mocking a decoded token with role "Admin"
      const decodedToken = { role: "employee" };
      callback(null, decodedToken);
    });
  });
 
  it("should return statusCode 200 if file is added successfully", async () => {
    // Stub the behavior of S3Client send method to resolve promises
    const s3ClientStub = sinon.stub(S3Client.prototype, "send").resolves({});
 
    const response = await chai
      .request(app)
      .post("/api/auth/upload")
      .set("Authorization", "Bearer mockedToken")
      .attach(
        "file",
        "/home/trishit/Pictures/profilePics/473-4739617_transparent-face-profile-png-round-profile-picture-png.png"
      );
    expect(response).to.have.status(200);
    s3ClientStub.restore();
  });
 
  // it("Should return statusCode 400 if no file is selected", (done) => {
  //   chai
  //     .request(app)
  //     .post("/file/uploadFileToS3")
  //     .set("Authorization", "Bearer mockedToken")
  //     .send({})
  //     .end((err, response) => {
  //       expect(response).to.have.status(404);
  //       expect(response.body.message).to.equal("File not found");
  //       done();
  //     });
  // });
 
  it("Should return statusCode 500 if there is error while sending file to S3", (done) => {
    const s3ClientStub = sinon
      .stub(S3Client.prototype, "send")
      .rejects(new Error("Test Error"));
 
    chai
      .request(app)
      .post("/api/auth/upload")
      .set("Authorization", "Bearer mockedToken")
      .attach(
        "file",
        "/home/trishit/Pictures/profilePics/473-4739617_transparent-face-profile-png-round-profile-picture-png.png"
      )
      .end((err, response) => {
        expect(response).to.have.status(500);
       
        s3ClientStub.restore();
        done();
      });
  });
});

