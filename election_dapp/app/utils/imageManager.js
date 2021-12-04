const fs = require('fs');
const tempFilePath = process.env.TEMP_FILES


module.exports.saveImage = (base64String, fileName) => new Promise((resolve, reject) => {

  let base64Data = base64String.replace(/^data:image\/png;base64,/, "");
  base64Data += base64Data.replace('+', ' ');
  let binaryData = new Buffer.from(base64Data, 'base64').toString('binary');

  fs.writeFile(`${tempFilePath}/${fileName}.png`, binaryData, "binary", function (err) {

      console.log(err, 'error in imageManager ssssssss'); // writes out file without error, but it's not a valid image
      if (err) reject(err)
      resolve(true)
  });
});


module.exports.removeImage = (fileName) =>  {
  const path = `${tempFilePath}/${fileName}.png`;
  try {
    fs.unlinkSync(path)
    console.log(path, 'file is removed')
  } catch (error) {
    throw {
      success: false,
      message: error,
      status: 200
    }
  }
};
