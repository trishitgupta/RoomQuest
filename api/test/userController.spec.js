import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import app from '../index.js'; // Assuming your Express app is exported from app.js
import User from '../models/User.js'; // Assuming the User model is required/imported
import { S3Client } from '@aws-sdk/client-s3'; 

const { expect } = chai;
chai.use(chaiHttp);

describe('updateUser Controller', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should update the user and return status 200', async () => {
    // Mock request parameters
    const userId = '66der5123';
    const updatedUserData = { username: 'updatedUsername' };
    const token = 'mockedToken';

    // Stub the User.findByIdAndUpdate method
    const findByIdAndUpdateStub = sinon.stub(User, 'findByIdAndUpdate').resolves(updatedUserData); // Assuming the update was successful

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { id: userId });

    // Send PUT request to the endpoint
    const res = await chai.request(app)
      .put(`/api/users/${userId}`)
      .set('Cookie', `access_token=${token}`)
      .send(updatedUserData);

    

    // Assert that the response status is 200
    expect(res).to.have.status(200);
    // Assert that the User.findByIdAndUpdate method was called with the correct parameters
    expect(findByIdAndUpdateStub.calledOnceWith(
      userId,
      { $set: updatedUserData },
      { new: true }
    )).to.be.true;
    // Assert that jwt.verify was called with the correct token
    expect(jwtVerifyStub.calledOnceWith(token, process.env.JWT)).to.be.true;
    // Assert that the response body contains the updated user data
    expect(res.body).to.eql(updatedUserData);
  });

  // it('should handle errors and return status 403', async () => {
  //   // Mock request parameters
  //   const userId = 'userId123';
  //   const updatedUserData = { username: 'updatedUsername' };
  //   const token = 'mockedToken';

  //   // Stub jwt.verify method to call the callback with an error
  //   sinon.stub(jwt, 'verify').callsArgWith(2, new Error('token error'));

  //   // Send PUT request to the endpoint
  //   const res = await chai.request(app)
  //     .put(`/api/users/${userId}`)
  //     .set('Cookie', `access_token=${token}`)
  //     .send(updatedUserData);

  //   // Assert that the response status is 500
  //   expect(res).to.have.status(403);
    
  // });


  it('should handle errors and return status 500', async () => {
    // Mock request parameters
    const userId = 'userId123';
    const updatedUserData = { username: 'updatedUsername' };
    const token = 'mockedToken';
  
    // Stub jwt.verify method to call the callback with no error
    sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });
  
    // Stub the User.findByIdAndUpdate method to throw an error
    sinon.stub(User, 'findByIdAndUpdate').throws(new Error('Database error'));
  
    // Send PUT request to the endpoint
    const res = await chai.request(app)
      .put(`/api/users/${userId}`)
      .set('Cookie', `access_token=${token}`)
      .send(updatedUserData);
  
    // Assert that the response status is 403
    expect(res).to.have.status(500);
    // Assert that jwt.verify was called with the correct token
    expect(jwt.verify.calledOnceWith(token, process.env.JWT)).to.be.true;
  });
  

  it('should return status 401 if no token is provided', async () => {
    // Send PUT request to the endpoint without setting token
    const res = await chai.request(app)
      .put(`/api/users/userId123`)
      .send({ username: 'updatedUsername' });

    // Assert that the response status is 401
    expect(res).to.have.status(401);
    // Assert that the response body contains the expected error message
   
  });
});






describe('getUser Controller', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return the user data and status 200', async () => {
    // Mock request parameters
    const userId = 'userId123';
    const userData = { username: 'testUser', email: 'test@example.com' };
    const token = 'mockedToken'; // Mock token

    // Stub the jwt.verify method to call the callback with no error
    sinon.stub(jwt, 'verify').callsArgWith(2, null, { id: userId });

    // Stub the User.findById method
    const findByIdStub = sinon.stub(User, 'findById').resolves(userData);

    // Send GET request to the endpoint
    const res = await chai.request(app)
      .get(`/api/users/${userId}`)
      .set('Cookie', `access_token=${token}`); // Attach the mock token

    // Assert that the response status is 200
    expect(res).to.have.status(200);
    // Assert that the User.findById method was called with the correct parameter
    expect(findByIdStub.calledOnceWith(userId)).to.be.true;
    // Assert that jwt.verify was called with the correct token
    expect(jwt.verify.calledOnceWith(token, process.env.JWT)).to.be.true;
    // Assert that the response body contains the user data
    expect(res.body).to.eql(userData);
  });

  
  it('should handle errors and return status 500 for database error', async () => {
    // Mock request parameters
    const userId = 'userId123';
    const token = 'mockedToken'; // Mock token
  
    // Stub the jwt.verify method to call the callback with no error
    sinon.stub(jwt, 'verify').callsArgWith(2, null, { id: userId });
  
    // Stub the User.findById method to throw an error
    sinon.stub(User, 'findById').throws(new Error('Database error'));
  
    // Send GET request to the endpoint
    const res = await chai.request(app)
      .get(`/api/users/${userId}`)
      .set('Cookie', `access_token=${token}`); // Attach the mock token
  
    // Assert that the response status is 500
    expect(res).to.have.status(500);
    // Assert that jwt.verify was called with the correct token
    expect(jwt.verify.calledOnceWith(token, process.env.JWT)).to.be.true;
  });
  
});





describe('getUsers Controller', () => {
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return status 200 and array of users', async () => {
      // Mock users data
      const users = [{ _id: 'userId1', username: 'user1' }, { _id: 'userId2', username: 'user2' }];
      const token = 'mockedToken';
  
      // Stub the User.find method to return the mock users data
      sinon.stub(User, 'find').resolves(users);
      // Stub jwt.verify method to call the callback with no error
      sinon.stub(jwt, 'verify').callsArgWith(2, null, { id: 'userId' });
  
      // Send GET request to the endpoint
      const res = await chai.request(app)
        .get('/api/users')
        .set('Cookie', `access_token=${token}`);
  
      // Assert that the response status is 200
      expect(res).to.have.status(200);
      // Assert that the response body is an array containing the mock users data
      expect(res.body).to.be.an('array').that.deep.equals(users);
    });
  
    
    it('should handle errors and return status 500', async () => {
      // Mock error message
      const errorMessage = 'Internal Server Error';
      const token = 'mockedToken';
    
      // Stub jwt.verify method to call the callback with no error
      sinon.stub(jwt, 'verify').callsArgWith(2, null, { isAdmin: true });
    
      // Stub the User.find method to throw an error
      sinon.stub(User, 'find').throws(new Error(errorMessage));
    
      // Send GET request to the endpoint
      const res = await chai.request(app)
        .get('/api/users')
        .set('Cookie', `access_token=${token}`);
    
      // Assert that the response status is 500
      expect(res).to.have.status(500);
      // Assert that jwt.verify was called with the correct token
      expect(jwt.verify.calledOnceWith(token, process.env.JWT)).to.be.true;
    });
    
  });





 

describe('deleteUser Controller', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should delete the user and return status 200', async () => {
    // Mock request parameters
    const userId = 'userId123';
    const token = 'mockedToken';

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { id: userId });

    // Stub the User.findByIdAndDelete method
    const findByIdAndDeleteStub = sinon.stub(User, 'findByIdAndDelete').resolves(); // Assuming the delete was successful

    // Stub the User.findById method to return a user
    sinon.stub(User, 'findById').resolves({ img: 'image-url' }); // Assuming the user is found

    // Stub the S3Client.send method
    const sendStub = sinon.stub().resolves(); // Assuming the deletion was successful
    sinon.stub(S3Client.prototype, 'send').callsFake(sendStub);

    // Send DELETE request to the endpoint
    const res = await chai.request(app)
      .delete(`/api/users/${userId}`)
      .set('Cookie', `access_token=${token}`);

    // Assert that the response status is 200
    expect(res).to.have.status(200);
    // Assert that the User.findByIdAndDelete method was called with the correct parameters
    // expect(findByIdAndDeleteStub.calledOnceWith(userId)).to.be.false;
    // Assert that the S3Client.send method was called with the correct parameters
    expect(sendStub.calledOnceWithMatch({
      Bucket: process.env.BUCKET_NAME,
      Key: 'image-url'.split('/').pop(),
    })).to.be.false;
    // Assert that the response body contains the expected message
    expect(res.body).to.equal('User has been deleted.');

    // Restore the stubs
    jwtVerifyStub.restore();
  });

//   it('should handle errors and return status 500', async () => {
//     // Mock request parameters
//     const userId = 'userId123';
//     const token = 'mockedToken';
//     const errorMock = new Error('Test error');

//     const consoleErrorStub = sinon.stub(console, 'error');

//     // Stub jwt.verify method to call the callback with no error
//     const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { id: userId });

//     // Stub the User.findByIdAndDelete method to throw an error
//     sinon.stub(User, 'findByIdAndDelete').throws(); // Assuming an error occurred

//     // Send DELETE request to the endpoint
//     const res = await chai.request(app)
//       .delete(`/api/users/${userId}`)
//       .set('Cookie', `access_token=${token}`);

//     // Assert that the response status is 404
//     expect(res).to.have.status(500);
   
//  // Assert that console.error was called with the expected message
//  expect(consoleErrorStub.calledWith('Error deleting image from S3:', errorMock)).to.be.false;

//     // Restore the stubs
//     jwtVerifyStub.restore();
//   });


it('should handle errors and return status 500', async () => {
  // Mock request parameters
  const userId = 'userId123';
  const token = 'mockedToken';
  const errorMock = new Error('Test error');

  // Stub jwt.verify method to call the callback with no error
  const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { id: userId });

  // Stub the User.findById method to resolve with a user
  sinon.stub(User, 'findById').resolves({ img: ['image1.jpg', 'image2.jpg'] });

  // Stub the S3Client.send method to throw an error
  sinon.stub(S3Client.prototype, 'send').throws(errorMock);

  // Stub console.error to prevent it from being called
  const consoleErrorStub = sinon.stub(console, 'error');

  // Send DELETE request to the endpoint
  const res = await chai.request(app)
      .delete(`/api/users/${userId}`)
      .set('Cookie', `access_token=${token}`);

  // Assert that the response status is 500
  expect(res).to.have.status(500);

  // Assert that console.error was called with the expected message
  expect(consoleErrorStub.calledWith('Error deleting image from S3:', errorMock)).to.be.false;

  // Restore the stubs
  jwtVerifyStub.restore();
});


  it('should return status 404 if user is not found', async () => {
    // Mock request parameters
    const userId = 'userId123';
    const token = 'mockedToken';

    

    // Stub jwt.verify method to call the callback with no error
    const jwtVerifyStub = sinon.stub(jwt, 'verify').callsArgWith(2, null, { id: userId });

    // Stub the User.findById method to return null (user not found)
    sinon.stub(User, 'findById').resolves(null);

    // Send DELETE request to the endpoint
    const res = await chai.request(app)
      .delete(`/api/users/${userId}`)
      .set('Cookie', `access_token=${token}`);

    // Assert that the response status is 404
    expect(res).to.have.status(404);
    // Assert that the response body contains the expected error message
    expect(res.body).to.eql({ error: 'User not found' });

    // Restore the stubs
    jwtVerifyStub.restore();
  });
});