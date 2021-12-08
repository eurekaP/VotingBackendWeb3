const request = require("request");
const fs = require("fs");
const { saveImage, removeImage } = require('./imageManager');
const luxandToken = process.env.LUXAND_TOKEN;
const tempFilePath = process.env.TEMP_FILES

const randomName = (length=10) => Math.random().toString(20).substr(2, length);

module.exports.createPerson = (params) => new Promise((resolve, reject) => {
  const {name, base64data} = params;
  const fileName = randomName();
  saveImage(base64data, fileName)
  .then(res => {
    console.log(res, 'this is the res of save image ............')
    


    // resolve (214);
    // ============== Temporary Comment this for signup test ========= (2021/12/7) //// 
    
    const photo = fs.createReadStream(`${tempFilePath}/${fileName}.png`);
    const options = {
      method: 'POST',
      url: "https://api.luxand.cloud/subject/v2",
      qs: {
        "name": name,
        "store": "1"
      },
      headers: {
        'token': luxandToken
      },
      formData: {
        photo: photo,
      }
    }
    request(options, function (error, response, body) {
      // if (error) throw new Error(error);
      removeImage(fileName);
      body = JSON.parse(body)
      if (error) reject(error);
      console.log('++++++++++++++++++++++++++++++++++')
      console.log(body);
      console.log('++++++++++++++++++++++++++++++++++')
      console.log(body['status'])
      if (body['status'] === 'success') {
        console.log('created successfully!')
        resolve(body.id)
      } else {
        reject(body['status'])
      };
      // resolve(body);
    })
  })
});


module.exports.verifyPerson = (params) => new Promise((resolve, reject) => {
  const {luxandId, base64data} = params;
  const fileName = randomName();
  saveImage(base64data, fileName)

  .then(res => {
    const photo = fs.createReadStream(`${tempFilePath}/${fileName}.png`);
    const options = {
      method: 'POST',
      url: `https://api.luxand.cloud/photo/verify/${luxandId}`,
      qs: {},
      headers: {
        'token': luxandToken
      },
      formData: {
        photo: photo,
      }
    }
    request(options, function (error, response, body) {
      // if (error) throw new Error(error);
      removeImage(fileName);
      body = JSON.parse(body)
      console.log(body)
      if (error) reject(error);
      if (body['status'] === 'success') {
        resolve(body['status'])
      } else {
        reject({status: body['status']})
      };
      // resolve(body);
    })
  })
});

