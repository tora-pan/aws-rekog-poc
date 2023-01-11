import {
  GetTextDetectionCommand,
  RekognitionClient,
  StartTextDetectionCommand,
} from "@aws-sdk/client-rekognition";
import {
  createTopicandQueue,
  getSQSMessageSuccess,
  deleteQueue,
  deleteTopic,
} from "./createTopicAndQue.js";

const rekClient = new RekognitionClient({
  region: "us-east-1",
});
let startJobId = "";

const videoName = "short-ver-dup.mp4";
// "001-720-FOR308-F03-04-1-0ef39234-3730-4ab3-af1c-49fe482c95b6.mp4";

const runTextDetectionAndGetResults = async () => {
  try {
    const sqsAndTopic = await createTopicandQueue();
    const startTextDetectionRes = await startTextDetection(
      process.env["AWS_REKOGNITION_ARN"],
      sqsAndTopic[1]
    );
    const getSQSMessageStatus = await getSQSMessageSuccess(
      sqsAndTopic[0],
      startTextDetectionRes
    );
    console.log(getSQSMessageSuccess);
    if (getSQSMessageSuccess) {
      console.log("Retrieving results:");
      const results = await getTextDetectionResults(startTextDetectionRes);
      return results;
    }

    await deleteQueue(sqsAndTopic);
    console.log("deleted queue");
    await deleteTopic(sqsAndTopic);
    console.log("deleted topic");
  } catch (err) {
    console.log("Error", err);
  }
};

const getTextDetectionResults = async (startJobId) => {
  console.log("Retrieving Segment Detection results");
  // Set max results, paginationToken and finished will be updated depending on response values
  let maxResults = 10;
  let paginationToken = "";
  let finished = false;
  // let results = [];

  // Begin retrieving segment detection results
  while (finished == false) {
    var response = await rekClient.send(
      new GetTextDetectionCommand({
        JobId: startJobId,
        SortBy: "TIMESTAMP",
      })
    );
    // log metadata
    // console.log(response);
    let slideTextResults = {};
    let currentSlide = 0;
    response.TextDetections.map((segment) => {
      if (segment.TextDetection.Type === "WORD") {
        return;
      }

      let textResult = segment.TextDetection.DetectedText.replace(
        "undefined",
        ""
      );

      if (slideTextResults[textResult]?.curSlide < currentSlide) {
        console.log(`duplicate detected at ${segment.Timestamp}.`);
        return;
      }

      if (!slideTextResults[textResult]) {
        currentSlide++;
        slideTextResults[textResult] = {
          curSlide: currentSlide,
          timeStamps: [],
        };
      }
      // catch a previously seen slide.

      slideTextResults[textResult].timeStamps.push(segment.Timestamp);
    });

    for (let item in slideTextResults) {
      slideTextResults[item].timeStamps = {
        start: slideTextResults[item].timeStamps[0],
        end: slideTextResults[item].timeStamps[
          slideTextResults[item].timeStamps.length - 1
        ],
      };
    }
    console.log(slideTextResults);
    finished = true;
    return slideTextResults;
  }
};

const startTextDetection = async (roleArn, snsTopicArn) => {
  console.log({ roleArn, snsTopicArn });
  try {
    //Initiate Segment detection and update value of startJobId with returned Job ID
    const textDetectionResponse = await rekClient.send(
      new StartTextDetectionCommand({
        Video: {
          S3Object: {
            Bucket: process.env["ON_DEMAND_TRANSCODED_VIDEOS_BUCKET"],
            Name: videoName,
          },
        },
        Filters: {
          RegionsOfInterest: [
            {
              BoundingBox: {
                Width: 1,
                Height: 0.1,
                Left: 0,
                Top: 0,
              },
            },
          ],
        },
        NotificationChannel: {
          RoleArn: roleArn,
          SNSTopicArn: snsTopicArn,
        },
      })
    );
    startJobId = textDetectionResponse.JobId;
    console.log(`JobID: ${startJobId}`);
    return startJobId;
  } catch (err) {
    console.log("Error", err);
  }
};

export {
  runTextDetectionAndGetResults,
  startTextDetection,
  getTextDetectionResults,
};
