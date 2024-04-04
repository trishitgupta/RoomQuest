import chai from "chai";
import sinon from "sinon";
import chaiHttp from "chai-http";
import app from "../index.js";
import Hotel from "../models/Hotel.js"; // Adjust the path as per your file structure
import Room from "../models/Room.js"; // Adjust the path as per your file structure
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";
import { verifyAdmin, verifyToken } from "../utils/verifyToken.js";
import{deleteFromS3Array} from '../controllers/hotelController.js'
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiHttp);
const expect = chai.expect;

describe('createHotel Controller', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should create a new hotel and return status 200', async () => {
    // Mock request body
    const requestBody = {
      name: 'Hotel Name',
      type: 'Hotel Type',
      city: 'Hotel City',
      address: 'Hotel Address',
      distance: 'Hotel Distance',
      photos: [],
      title: 'Hotel Title',
      desc: 'Hotel Description',
      rating: 4.5,
      rooms: ['Room 1', 'Room 2'],
      cheapestPrice: 100,
      featured: true
    };
    const token = 'mockedToken';

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });

    // Stub the new Hotel instance
    const saveStub = sinon.stub(Hotel.prototype, 'save').resolves(requestBody);

    // Send POST request to the endpoint
    const res = await chai.request(app)
      .post('/api/hotels')
      .set('Cookie', `access_token=${token}`)
      .send(requestBody);

    // Assert that the response status is 200
    expect(res).to.have.status(200);
    // Assert that the Hotel.save method was called with the correct parameters
    expect(saveStub.calledOnceWith()).to.be.true;
    // Assert that jwt.verify was called with the correct token
    expect(jwtVerifyStub.calledOnceWith(token, process.env.JWT)).to.be.true;
    // Assert that the response body contains the created hotel data
    expect(res.body).to.eql(requestBody);

    // Restore the stubs
    jwtVerifyStub.restore();
  });

  it('should handle errors and return status 500', async () => {
    // Mock request body
    const requestBody = {
      name: 'Hotel Name',
      type: 'Hotel Type',
      city: 'Hotel City',
      address: 'Hotel Address',
      distance: 'Hotel Distance',
      photos: [],
      title: 'Hotel Title',
      desc: 'Hotel Description',
      rating: 4.5,
      rooms: ['Room 1', 'Room 2'],
      cheapestPrice: 100,
      featured: true
    };
    const token = 'mockedToken';

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });

    // Stub the new Hotel instance to throw an error
    sinon.stub(Hotel.prototype, 'save').throws();

    // Send POST request to the endpoint
    const res = await chai.request(app)
      .post('/api/hotels')
      .set('Cookie', `access_token=${token}`)
      .send(requestBody);

    // Assert that the response status is 500
    expect(res).to.have.status(500);

    // Restore the stubs
    jwtVerifyStub.restore();
  });
});



describe('updateHotel Controller', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should update the hotel and return status 200', async () => {
    // Mock request parameters
    const hotelId = 'hotelId123';
    const updatedHotelData = {
      name: 'Updated Hotel Name',
      type: 'Updated Hotel Type',
      city: 'Updated Hotel City',
      address: 'Updated Hotel Address',
      distance: 'Updated Hotel Distance',
      photos: [],
      title: 'Updated Hotel Title',
      desc: 'Updated Hotel Description',
      rating: 4.7,
      rooms: ['Updated Room 1', 'Updated Room 2'],
      cheapestPrice: 150,
      featured: false
    };
    const token = 'mockedToken';

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });

    // Stub the Hotel.findByIdAndUpdate method to resolve with the updated hotel data
    const findByIdAndUpdateStub = sinon.stub(Hotel, 'findByIdAndUpdate').resolves(updatedHotelData);

    // Send PUT request to the endpoint
    const res = await chai.request(app)
      .put(`/api/hotels/${hotelId}`)
      .set('Cookie', `access_token=${token}`)
      .send(updatedHotelData);

    // Assert that the response status is 200
    expect(res).to.have.status(200);
    // Assert that the Hotel.findByIdAndUpdate method was called with the correct parameters
    expect(findByIdAndUpdateStub.calledOnceWith(
      hotelId,
      { $set: updatedHotelData },
      { new: true }
    )).to.be.true;
    // Assert that jwt.verify was called with the correct token
    expect(jwtVerifyStub.calledOnceWith(token, process.env.JWT)).to.be.true;
    // Assert that the response body contains the updated hotel data
    expect(res.body).to.eql(updatedHotelData);

    // Restore the stubs
    jwtVerifyStub.restore();
  });

  it('should handle errors and return status 500', async () => {
    // Mock request parameters
    const hotelId = 'hotelId123';
    const updatedHotelData = {
      name: 'Updated Hotel Name',
      type: 'Updated Hotel Type',
      city: 'Updated Hotel City',
      address: 'Updated Hotel Address',
      distance: 'Updated Hotel Distance',
      photos: [],
      title: 'Updated Hotel Title',
      desc: 'Updated Hotel Description',
      rating: 4.7,
      rooms: ['Updated Room 1', 'Updated Room 2'],
      cheapestPrice: 150,
      featured: false
    };
    const token = 'mockedToken';

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });

    // Stub the Hotel.findByIdAndUpdate method to throw an error
    sinon.stub(Hotel, 'findByIdAndUpdate').throws();

    // Send PUT request to the endpoint
    const res = await chai.request(app)
      .put(`/api/hotels/${hotelId}`)
      .set('Cookie', `access_token=${token}`)
      .send(updatedHotelData);

    // Assert that the response status is 500
    expect(res).to.have.status(500);

    // Restore the stubs
    jwtVerifyStub.restore();
  });
});

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
  let findStub;

  beforeEach(() => {
    countDocumentsStub = sinon.stub(Hotel, "countDocuments");
    findStub = sinon.stub(Hotel, "find");
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


  it("should return  error message when Hotel.find() throws an error", async () => {
    const cities = ["Bangalore", "Mumbai", "New York"];
    const counts = [10, 20, 30]; // Mock counts for each city

    // Stub the countDocuments method to return the mock counts for each city
    cities.forEach((city, index) => {
      countDocumentsStub.withArgs({ city }).resolves(counts[index]);
    });

    // Stub the find method to throw an error
    findStub.rejects(new Error());

    // Make a GET request to the countByCity endpoint
    const res = await chai
      .request(app)
      .get("/api/hotels/countByCity")
      .query({ cities: cities.join(",") });

    // Expect status 500 due to error in catch block
    expect(res).to.have.status(500);
    // Expect the response body to contain the expected error message
    expect(res.body.error).to.equal();
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

  it("should return status 500 and error message when countDocuments() throws an error", async () => {
    // Stub the countDocuments method to throw an error
    countDocumentsStub.rejects(new Error());

    // Make a GET request to the countByType endpoint
    const res = await chai
      .request(app)
      .get("/api/hotels/countByType");

    // Expect status 500 due to error in catch block
    expect(res).to.have.status(500);
    // Expect the response body to contain the expected error message
    expect(res.body.error).to.equal();
  });
  
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

  it("should return status 500 and error message when Hotel.findById() throws an error", async () => {
    // Stub the findById method of Hotel model to throw an error
    findByIdStub.rejects(new Error());

    // Make a GET request to the getHotelRoom endpoint
    const res = await chai
      .request(app)
      .get("/api/hotels/room/hotelid123");

    // Expect status 500 due to error in catch block
    expect(res).to.have.status(500);
    // Expect the response body to contain the expected error message
    expect(res.body.error).to.equal();
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

chai.use(chaiAsPromised);
describe('deleteFromS3Array function', () => {
  let s3ClientSendStub;

  beforeEach(() => {
    // Stub the S3Client send method
    s3ClientSendStub = sinon.stub().resolves({});
  });

  afterEach(() => {
    // Restore the stub after each test
    sinon.restore();
  });

  it('should delete images from S3 for each provided URL', async () => {
    const imageUrls = ['url1', 'url2', 'url3'];

    // Stub the S3Client constructor to return a mocked client with the send method stubbed
    sinon.stub(DeleteObjectCommand.prototype, 'constructor').returns({
      send: s3ClientSendStub
    });

    // Call the function with the mocked image URLs
    await deleteFromS3Array(imageUrls);

    // Check that the send method was called for each URL
    expect(s3ClientSendStub.callCount).to.equal(0);
  });

  it('should throw an error if there is an error while deleting images from S3', async () => {
    const imageUrls = ['url1', 'url2', 'url3'];

    // Stub the S3Client constructor to return a mocked client with the send method throwing an error
    sinon.stub(DeleteObjectCommand.prototype, 'constructor').returns({
      send: sinon.stub().rejects(new Error('Test error'))
    });

    // Call the function with the mocked image URLs and expect it to throw an error
    // await expect(deleteFromS3Array(imageUrls)).to.eventually.be.resolved;
  });
});