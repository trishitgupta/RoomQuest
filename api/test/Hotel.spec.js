import chai from "chai";
import sinon from "sinon";
import chaiHttp from "chai-http";
import app from "../index.js";
import Hotel from "../models/Hotel.js"; // Adjust the path as per your file structure
import Room from "../models/Room.js"; // Adjust the path as per your file structure
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";

chai.use(chaiHttp);
const expect = chai.expect;

// describe('createHotel Route', () => {
//     const verifyTokenStub = sinon.stub().callsFake((req, res, next, callback) => {
//         // Simulate authentication by calling the callback without errors
//         callback();
//       });

//       // In your beforeEach hook, replace the original verifyToken function with the stub
//       beforeEach(() => {

//       });

//       // In your afterEach hook, restore the original verifyToken function
//       afterEach(() => {
//         sinon.restore();
//       });

//   it('should create a new hotel if user is admin', async () => {
//     const mockHotel = {
//         name: 'dummy1',
//         type: 'villa',
//         city: 'bangalore',
//         address: 'SC',
//         distance: '400'
//     };

//     // Simulate an admin user by modifying the req object
//     const req = { user: { isAdmin: true } };

//     // Send a POST request to the create hotel route with the modified req object
//     const res = await chai.request(app)
//       .post('/api/hotels')
//       .set('Content-Type', 'application/json')
//       .send(mockHotel)
//       .set('Authorization', 'Bearer ' + jwt.sign(req.user, process.env.JWT));

//       console.log(res);

//     // Assert that the response status is 200 and contains the saved hotel data
//     expect(res).to.have.status(401);

// });

// });

describe(" delete Hotel Routes", () => {
  let findByIdStub;
  let findByIdAndDeleteStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Hotel, "findById");
    findByIdAndDeleteStub = sinon.stub(Hotel, "findByIdAndDelete");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 404 if hotel is not found", (done) => {
    findByIdStub.resolves(null);

    chai
      .request(app)
      .delete("/api/hotels/hotelId") // Adjust the ID as needed
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("should delete hotel and return 200", (done) => {
    const mockHotel = { _id: "hotelId", name: "Hotel ABC" };
    findByIdStub.resolves(mockHotel);

    chai
      .request(app)
      .delete("/api/hotels/hotelId") // Adjust the ID as needed
      .end((err, res) => {
        expect(findByIdAndDeleteStub.calledWith("hotelId")).to.be.true;
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should call next with error if an error occurs", (done) => {
    const error = new Error("Internal Server Error");
    findByIdStub.rejects(error);

    chai
      .request(app)
      .delete("/api/hotels/hotelId") // Adjust the ID as needed
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });
});

describe(" get Hotel Routes", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Hotel, "findById");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return the hotel with the given ID", (done) => {
    const mockHotel = { _id: "hotelId", name: "Hotel ABC" };
    findByIdStub.withArgs("hotelId").resolves(mockHotel);

    chai
      .request(app)
      .get("/api/hotels/find/hotelId") // Adjust the ID as needed
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(mockHotel);
        done();
      });
  });

  it("should call next with error if an error occurs", (done) => {
    const error = new Error("Internal Server Error");
    findByIdStub.rejects(error);

    chai
      .request(app)
      .get("/api/hotels/find/hotelId") // Adjust the ID as needed
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });
});

describe("getHotels  Routes", () => {
  let findStub;

  beforeEach(() => {
    findStub = sinon.stub(Hotel, "find").returnsThis();
    const execStub = sinon
      .stub()
      .resolves([{ _id: "hotel1", name: "Hotel ABC" }]); // Resolve with mock data
    findStub.exec = execStub; // Stub the `exec()` method
  });

  afterEach(() => {
    sinon.restore();
  });

  // it('should return a list of hotels based on query parameters', (done) => {
  //   // Return `this` to chain `.exec()`

  //   chai.request(app)
  //     .get('/api/hotels?city=mumbai')
  //     .end((err, res) => {
  //       //console.log(res);

  //       expect(res).to.have.status(200);
  //       expect(res.body).to.deep.equal(mockHotels);

  //       done();
  //     });
  // });

  // it('should apply limit to the number of hotels returned', (done) => {
  //   const mockHotels = [{ _id: 'hotel1', name: 'Hotel ABC' }];
  //   findStub.withArgs({}).resolves(mockHotels);

  //   chai.request(app)
  //     .get('/api/hotels?limit=1')
  //     .end((err, res) => {
  //       expect(res).to.have.status(200);
  //       expect(res.body).to.have.lengthOf(1);
  //       done();
  //     });
  // });

  it("should handle errors gracefully", (done) => {
    const error = new Error("Internal Server Error");
    findStub.rejects(error);

    chai
      .request(app)
      .get("/api/hotels")
      .end((err, res) => {
        expect(res).to.have.status(500);
        done();
      });
  });
});

describe("CountCity Routes", () => {
  let countDocumentsStub;

  beforeEach(() => {
    countDocumentsStub = sinon.stub(Hotel, "countDocuments");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return the count of hotels for each city", async () => {
    const cities = ["Bangalore", "Mumbai", "New York"];
    const counts = [10, 20, 30]; // Mock counts for each city

    // Stub the countDocuments method to return the mock counts for each city
    cities.forEach((city, index) => {
      countDocumentsStub.withArgs({ city }).resolves(counts[index]);
    });

    // Make a GET request to the countByCity endpoint
    const res = await chai
      .request(app)
      .get("/api/hotels/countByCity")
      .query({ cities: cities.join(",") });

    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal(counts);
  });
});

describe("HotelType count ", () => {
  let countDocumentsStub;

  beforeEach(() => {
    countDocumentsStub = sinon.stub(Hotel, "countDocuments");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return the count of hotels by type", async () => {
    // Mock counts for each hotel type
    const counts = {
      hotel: 10,
      apartment: 20,
      resort: 30,
      villa: 15,
      cabin: 5,
    };

    // Stub the countDocuments method to return the mock counts for each type
    Object.entries(counts).forEach(([type, count]) => {
      countDocumentsStub.withArgs({ type }).resolves(count);
    });

    // Make a GET request to the countByType endpoint
    const res = await chai.request(app).get("/api/hotels/countByType");

    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal([
      { type: "hotel", count: counts.hotel },
      { type: "apartment", count: counts.apartment },
      { type: "resort", count: counts.resort },
      { type: "villa", count: counts.villa },
      { type: "cabin", count: counts.cabin },
    ]);
  });

  // Add more test cases as needed
});

describe("Hotel Routes", () => {
  let findByIdStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(Hotel, "findById");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should retrieve hotel rooms successfully", async () => {
    // Mock hotel and room data
    const mockHotel = {
      _id: "hotelId123",
      rooms: ["room1Id", "room2Id", "room3Id"], // Assuming room IDs are valid
    };
    const mockRooms = [
      { _id: "room1Id", name: "Room 1" },
      { _id: "room2Id", name: "Room 2" },
      { _id: "room3Id", name: "Room 3" },
    ];

    // Stub the findById method of the Hotel model to resolve with the mock hotel
    findByIdStub.resolves(mockHotel);

    // Stub the findById method of the Room model to resolve with the mock rooms
    sinon.stub(Room, "findById").callsFake((roomId) => {
      return Promise.resolve(mockRooms.find((room) => room._id === roomId));
    });

    // Make a GET request to the getHotelRoom endpoint with the hotel ID
    const res = await chai.request(app).get("/api/hotels/room/hotelId123");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body).to.have.lengthOf(mockHotel.rooms.length);
    expect(res.body.map((room) => room.name)).to.deep.equal(
      mockRooms.map((room) => room.name)
    );
  });

  // Add more test cases as needed
});

describe("Test cases while uploading multiple files to S3", () => {
  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    // const jwtStub = sinon.stub(jwt, "verify");
    // jwtStub.callsFake((token, secret, callback) => {
    //   // Mocking a decoded token with role "Admin"
    //   const decodedToken = { role: "employee" };
    //   callback(null, decodedToken);
    // });
  });

  // it("should return statusCode 200 and array of links if files are added successfully", (done) => {
  //   // Stub the behavior of S3Client send method to resolve promises
  //   const s3ClientStub = sinon.stub(S3Client.prototype, "send").resolves({});

  //   chai
  //     .request(app)
  //     .post("/api/hotels/upload")
  //     .set("Authorization", "Bearer mockedToken")
  //     .attach("files", [
  //       "/home/trishit/Pictures/hotelPics/sheraton-palace-hotel-lobby-architecture-san-francisco-53464.jpeg",
  //         "/home/trishit/Pictures/hotelPics/pexels-photo-941861.jpeg",
  //     ])
  //     .end((err, response) => {
  //       expect(response).to.have.status(200);
      
  //       s3ClientStub.restore();
  //       done();
  //     });
  // });

  it("should return statusCode 200 and a link if the file is added successfully", (done) => {
    const s3ClientStub = sinon.stub(S3Client.prototype, "send").resolves({});

    chai
      .request(app)
      .post("/api/hotels/upload")
      .set("Authorization", "Bearer mockedToken")
      .attach("files", "/home/trishit/Pictures/hotelPics/pexels-photo-941861.jpeg") // Attach an array with a single file
      .end((err, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.an('array').and.to.have.lengthOf(1); // Expecting a single link to be returned
        expect(response.body[0]).to.be.a('string'); // Expecting a string link
        s3ClientStub.restore();
        done();
      });
  });


  it("should return statusCode 500 if no files are selected", async () => {
    const response = await chai
      .request(app)
      .post("/api/hotels/upload")
      .set("Authorization", "Bearer mockedToken")
      .send({});
    expect(response).to.have.status(500);
    expect(response.body).to.have.property("error", "No files uploaded");
  });

  it("should return statusCode 500 if there is error while sending files to S3", async () => {
    const s3ClientStub = sinon
      .stub(S3Client.prototype, "send")
      .rejects(new Error("Test Error"));

    const response = await chai
      .request(app)
      .post("/api/hotels/upload")
      .set("Authorization", "Bearer mockedToken")
      .attach("files", "/home/trishit/Pictures/hotelPics/pexels-photo-941861.jpeg"); // Add path to your file here

    expect(response).to.have.status(500);
    expect(response.body).to.have.property("error");
    s3ClientStub.restore();
  });

  // it("Should return statusCode 500 if there is error while sending files to S3", (done) => {
  //   const s3ClientStub = sinon
  //     .stub(S3Client.prototype, "send")
  //     .rejects(new Error("Test Error"));

  //   chai
  //     .request(app)
  //     .post("/api/hotels/upload")
  //     .set("Authorization", "Bearer mockedToken")
  //     .attach("files", [
  //       "/home/trishit/Pictures/hotelPics/sheraton-palace-hotel-lobby-architecture-san-francisco-53464.jpeg",
  //         "/home/trishit/Pictures/hotelPics/pexels-photo-941861.jpeg",
  //     ])
  //     .end((err, response) => {
  //       expect(response).to.have.status(500);
  //       s3ClientStub.restore();
  //       done();
  //     });
  // });
});
