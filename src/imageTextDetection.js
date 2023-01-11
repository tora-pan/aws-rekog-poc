import AWS from "aws-sdk";

const bucket = "ondemand-sandbox-transcoded-videos"; // the bucketname without s3://
const photo = "2.png"; // the name of file

// const config = new AWS.Config({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });
AWS.config.update({ region: "us-east-1" });
const client = new AWS.Rekognition();
const params = {
  Image: {
    S3Object: {
      Bucket: bucket,
      Name: photo,
    },
  },
};
let counter = 1;
const myLoop = () => {
  setTimeout(() => {
    params.Image.S3Object.Name = `${counter}.png`;

    client.detectText(params, function (err, response) {
      if (err) {
        console.log(err, err.stack); // handle error if an error occurred
      } else {
        console.log(`Detected Text for: ${params.Image.S3Object.Name}`);
        // console.log(response);
        response.TextDetections.forEach((label) => {
          if (label.Type === "LINE") {
            console.log(label.DetectedText);
          }
        });
        console.log(`photo ${params.Image.S3Object.Name}`);
        console.log("- - - - - - - - -");
        counter++;
        if (counter < 19) {
          myLoop();
        }
      }
    });
  }, 1000);
};

myLoop();

// for (let i = 1; i < 20; i++) {}
