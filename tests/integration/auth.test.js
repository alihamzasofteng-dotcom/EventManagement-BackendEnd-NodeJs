const request = require('supertest');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');

describe('auth middleware',()=>{

    beforeEach(() => { 
        process.env.PORT = 3001;
        server = require('../../index'); 
        jest.setTimeout(10000); // Set timeout to 10 seconds
    });

    // Properly close the server after each test to prevent leaks
    afterEach(async () => {
        try {
          await server.close();
          server = null; // Avoid reusing the same server instance
        } catch (err) {
          console.log("Error closing server:", err);
        }
        await Genre.deleteMany({});
      });
// mosh technique 
// function bna leta ha or us us ction ko nechy code kr deta ha jahan lines chahiye hn
// jahan function wala nai chahiye kuch wahan us function ki property ko replace kr deta ha nechy us ky apny 'it' main 
let token;
const exec = ()=>{
    return request(server).post('/api/genres').set('x-auth-token',token).send({name: 'genre1'}); 
   // await kr ky response mily ga .. wo tab chahiye jab isi ky nechy ham ny usko pkr ky koi kam krna ho 
   // lekin usy pkr ky kam ni krna so ham promise hi return krain gy without awaiting it
   // is oper waly promoise ko nechy it main await krwa sakty han 
}
beforeEach(()=>{
    token= new User().generateToken();
})
it('should return 401 if no token is provided', async () => {
  token = ''; 

  const res = await exec();

  expect(res.status).toBe(401);
});

it('should return 400 if token is invalid', async () => {
  token = 'a'; 

  const res = await exec();

  expect(res.status).toBe(400);
});

it('should return 200 if token is valid', async () => {
  const res = await exec();

  expect(res.status).toBe(200);
});

})