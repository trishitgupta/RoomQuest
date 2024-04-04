import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import app from '../index.js'; // Assuming your Express app is exported from app.js
import Room from '../models/Room.js'; // Assuming the Room model is required/imported
import jwt from "jsonwebtoken";
import Hotel from '../models/Hotel.js'

const { expect } = chai;
chai.use(chaiHttp);

describe('Room Routes', () => {
  afterEach(() => {
    sinon.restore();
  });


  describe('createRoom Controller', () => {
    afterEach(() => {
      sinon.restore();
    });
  
    it('should create a room and return status 200', async () => {
      // Mock request parameters
      const hotelId = 'hotelId123';
      const newRoomData = {
        title: 'New Room Title',
        price: 100,
        maxPeople: 2,
        desc: 'New Room Description',
        roomNumbers: [
          { number: 101, unavailableDates: [] },
          { number: 102, unavailableDates: [] }
        ]
      };
      const token = 'mockedToken';
  
      // Stub jwt.verify method to call the callback with no error
      const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });
  
      // Stub the Room.save method to resolve with the saved room data
      const saveStub = sinon.stub(Room.prototype, 'save').resolves(newRoomData);
  
      // Stub the Hotel.findByIdAndUpdate method to resolve with a success response
      const findByIdAndUpdateStub = sinon.stub(Hotel, 'findByIdAndUpdate').resolves();
  
      // Send POST request to the endpoint
      const res = await chai.request(app)
        .post(`/api/rooms/${hotelId}`)
        .set('Cookie', `access_token=${token}`)
        .send(newRoomData);
  
      // Assert that the response status is 200
      expect(res).to.have.status(200);
      // Assert that the Room.save method was called with the correct parameters
      expect(saveStub.calledOnceWithExactly()).to.be.true;
      // Assert that the Hotel.findByIdAndUpdate method was called with the correct parameters
      expect(findByIdAndUpdateStub.calledOnceWithExactly(
        hotelId,
        { $push: { rooms: newRoomData._id } }
      )).to.be.true;
      // Assert that jwt.verify was called with the correct token
      expect(jwtVerifyStub.calledOnceWith(token, process.env.JWT)).to.be.true;
      // Assert that the response body contains the created room data
      expect(res.body).to.eql(newRoomData);
  
      // Restore the stubs
      jwtVerifyStub.restore();
      saveStub.restore();
    });
  
    it('should handle errors and return status 500', async () => {
      // Mock request parameters
      const hotelId = 'hotelId123';
      const newRoomData = {
        title: 'New Room Title',
        price: 100,
        maxPeople: 2,
        desc: 'New Room Description',
        roomNumbers: [
          { number: 101, unavailableDates: [] },
          { number: 102, unavailableDates: [] }
        ]
      };
      const token = 'mockedToken';
  
      // Stub jwt.verify method to call the callback with no error
      const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });
  
      // Stub the Room.save method to throw an error
      sinon.stub(Room.prototype, 'save').throws(new Error('Database error'));
  
      // Send POST request to the endpoint
      const res = await chai.request(app)
        .post(`/api/rooms/${hotelId}`)
        .set('Cookie', `access_token=${token}`)
        .send(newRoomData);
  
      // Assert that the response status is 500
      expect(res).to.have.status(500);
  
      // Restore the stubs
      jwtVerifyStub.restore();
    });
  });




  it('should update room availability', async () => {
    // Mock request parameters
    const roomId = 'roomId123';
    const requestBody = { dates: ['2024-03-15', '2024-03-16'] };
    
    // Stub the Room.updateOne method
    const updateOneStub = sinon.stub(Room, 'updateOne').resolves({ nModified: 1 }); // Assuming the update was successful
    
    // Send PUT request to the endpoint
    const res = await chai.request(app)
      .put(`/api/rooms/availability/${roomId}`)
      .send(requestBody);

    // Assert that the response status is 200
    expect(res).to.have.status(200);
    // Assert that the Room.updateOne method was called with the correct parameters
    expect(updateOneStub.calledOnceWith(
      { 'roomNumbers._id': roomId },
      { $push: { 'roomNumbers.$.unavailableDates': requestBody.dates } }
    )).to.be.true;
    // Assert that the response body contains the expected message
    expect(res.body).to.equal('Room status has been updated.');
  });
  it('should handle errors', async () => {
    // Stub Room.updateOne method to throw an error
    const updateOneStub = sinon.stub(Room, 'updateOne').throws(new Error('Database error'));
    
    // Send PUT request to the endpoint
    const res = await chai.request(app)
      .put('/api/rooms/availability/invalidId')
      .send({ dates: ['2024-03-15', '2024-03-16'] });

    // Assert that the response status is 500
    expect(res).to.have.status(500);
    
  });
  
});



describe('updateRoom Controller', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should update the room and return status 200', async () => {
    // Mock request parameters
    const roomId = 'roomId123';
    const updatedRoomData = { title: 'Updated Room Title' };
    const token = 'mockedToken';

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });

    // Stub the Room.findByIdAndUpdate method to resolve with the updated room data
    const findByIdAndUpdateStub = sinon.stub(Room, 'findByIdAndUpdate').resolves(updatedRoomData);

    // Send PUT request to the endpoint
    const res = await chai.request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Cookie', `access_token=${token}`)
      .send(updatedRoomData);

    // Assert that the response status is 200
    expect(res).to.have.status(200);
    // Assert that the Room.findByIdAndUpdate method was called with the correct parameters
    expect(findByIdAndUpdateStub.calledOnceWithExactly(
      roomId,
      { $set: updatedRoomData },
      { new: true }
    )).to.be.true;
    // Assert that jwt.verify was called with the correct token
    expect(jwtVerifyStub.calledOnceWith(token, process.env.JWT)).to.be.true;
    // Assert that the response body contains the updated room data
    expect(res.body).to.eql(updatedRoomData);

    // Restore the stubs
    jwtVerifyStub.restore();
  });

  it('should handle errors and return status 500', async () => {
    // Mock request parameters
    const roomId = 'roomId123';
    const updatedRoomData = { title: 'Updated Room Title' };
    const token = 'mockedToken';

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });

    // Stub the Room.findByIdAndUpdate method to throw an error
    sinon.stub(Room, 'findByIdAndUpdate').throws();

    // Send PUT request to the endpoint
    const res = await chai.request(app)
      .put(`/api/rooms/${roomId}`)
      .set('Cookie', `access_token=${token}`)
      .send(updatedRoomData);

    // Assert that the response status is 500
    expect(res).to.have.status(500);

    // Restore the stubs
    jwtVerifyStub.restore();
  });
});


describe('deleteRoom Controller', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete the room and return status 200', async () => {
    // Mock request parameters
    const roomId = 'roomId123';
    const hotelId = 'hotelId123';
    const token = 'mockedToken';

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });

    // Stub the Room.findByIdAndDelete method to resolve
    const findByIdAndDeleteStub = sinon.stub(Room, 'findByIdAndDelete').resolves();

    // Stub the Hotel.findByIdAndUpdate method to resolve
    const hotelFindByIdAndUpdateStub = sinon.stub(Hotel, 'findByIdAndUpdate').resolves();

    // Send DELETE request to the endpoint
    const res = await chai.request(app)
      .delete(`/api/rooms/${roomId}/${hotelId}`)
      .set('Cookie', `access_token=${token}`);

    // Assert that the response status is 200
    expect(res).to.have.status(200);
    // Assert that the Room.findByIdAndDelete method was called with the correct parameters
    expect(findByIdAndDeleteStub.calledOnceWithExactly(roomId)).to.be.true;
    // Assert that the Hotel.findByIdAndUpdate method was called with the correct parameters
    expect(hotelFindByIdAndUpdateStub.calledOnceWithExactly(
      hotelId,
      { $pull: { rooms: roomId } }
    )).to.be.true;
    // Assert that jwt.verify was called with the correct token
    expect(jwtVerifyStub.calledOnceWith(token, process.env.JWT)).to.be.true;
    // Assert that the response body contains the expected message
    expect(res.body).to.equal('Room has been deleted.');

    // Restore the stubs
    jwtVerifyStub.restore();
  });

  it('should handle errors and return status 500', async () => {
    // Mock request parameters
    const roomId = 'roomId123';
    const hotelId = 'hotelId123';
    const token = 'mockedToken';

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });

    // Stub the Room.findByIdAndDelete method to throw an error
    sinon.stub(Room, 'findByIdAndDelete').throws();

    // Send DELETE request to the endpoint
    const res = await chai.request(app)
      .delete(`/api/rooms/${roomId}/${hotelId}`)
      .set('Cookie', `access_token=${token}`);

    // Assert that the response status is 500
    expect(res).to.have.status(500);

    // Restore the stubs
    jwtVerifyStub.restore();
  });
});



describe('getRoom Controller', () => {
    afterEach(() => {
      sinon.restore();
    });
  
    it('should get room by ID', async () => {
      // Mock room data
      const roomId = 'roomId123';
      const mockRoom = { _id: roomId, title: 'Sample Room', price: 100 };
  
      // Stub Room.findById method
      const findByIdStub = sinon.stub(Room, 'findById').resolves(mockRoom);
  
      // Send GET request to the endpoint
      const res = await chai.request(app)
        .get(`/api/rooms/${roomId}`);
  
      // Assert that the response status is 200
      expect(res).to.have.status(200);
      // Assert that the Room.findById method was called with the correct parameter
      expect(findByIdStub.calledOnceWith(roomId)).to.be.true;
      // Assert that the response body contains the expected room data
      expect(res.body).to.deep.equal(mockRoom);
    });
  
    it('should handle errors', async () => {
      // Stub Room.findById method to throw an error
      const findByIdStub = sinon.stub(Room, 'findById').throws(new Error('Database error'));
  
      // Send GET request to the endpoint
      const res = await chai.request(app)
        .get('/api/rooms/invalidId');
  
      // Assert that the response status is 500
      expect(res).to.have.status(500);
     
    });
  });

  

  describe('getRooms Controller', () => {
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return all rooms', async () => {
      // Mock room data
      const rooms = [{ _id: 'roomId1', title: 'Room 1' }, { _id: 'roomId2', title: 'Room 2' }];
  
      // Stub Room.find method to return rooms
      const findStub = sinon.stub(Room, 'find').resolves(rooms);
      
      // Send GET request to the endpoint
      const res = await chai.request(app).get('/api/rooms');
  
      // Assert that the response status is 200
      expect(res).to.have.status(200);
      // Assert that the response body matches the mocked room data
      expect(res.body).to.deep.equal(rooms);
    });
  
    it('should handle errors', async () => {
      // Stub Room.find method to throw an error
      const findStub = sinon.stub(Room, 'find').throws(new Error('Database error'));
      
      // Send GET request to the endpoint
      const res = await chai.request(app).get('/api/rooms');
  
      // Assert that the response status is 500
      expect(res).to.have.status(500);
      
    });
  });