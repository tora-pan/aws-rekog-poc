import { GetSegmentDetectionCommand, RekognitionClient, StartSegmentDetectionCommand } from "@aws-sdk/client-rekognition";
import { createTopicandQueue, getSQSMessageSuccess } from "./createTopicAndQue.js";

const rekClient = new RekognitionClient({
  region: "us-east-1",
});

let startJobId = "";
const videoName =
  "001-720-FOR308-F03-04-1-0ef39234-3730-4ab3-af1c-49fe482c95b6.mp4";

const runSegmentDetectionAndGetResults = async () => {
  try {
    const sqsAndTopic = await createTopicandQueue();
    const startSegmentDetectionRes = await startSegmentDetection(
      process.env["AWS_REKOGNITION_ARN"],
      sqsAndTopic[1]
    );
    const getSQSMessageStatus = await getSQSMessageSuccess(
      sqsAndTopic[0],
      startSegmentDetectionRes
    );
    console.log(getSQSMessageSuccess);
    if (getSQSMessageSuccess) {
      console.log("Retrieving results:");
      const results = await getSegmentDetectionResults(
        startSegmentDetectionRes
      );
      return results;
    }
    const deleteQueue = await deleteQueue(sqsAndTopic);
    const deleteTopic = await deleteTopic(sqsAndTopic);

    console.log("Successfully deleted.");
  } catch (err) {
    console.log("Error", err);
  }
};

const getSegmentDetectionResults = async (startJobId) => {
  console.log("Retrieving Segment Detection results");
  // Set max results, paginationToken and finished will be updated depending on response values
  var maxResults = 10;
  var paginationToken = "";
  var finished = false;
  let results = [];

  // Begin retrieving segment detection results
  while (finished == false) {
    var response = await rekClient.send(
      new GetSegmentDetectionCommand({
        JobId: startJobId,
        SortBy: "TIMESTAMP",
      })
    );
    // log metadata
    // console.log(response);
    // console.log(response.AudioMetadata);
    // console.log(response.VideoMetadata);
    // console.log(response.SelectedSegmentTypes);
    response.Segments.map((segment) => {
      console.log(segment);
      results.push(segment);
    });

    finished = true;
    return results;
  }
};

const startSegmentDetection = async (roleArn, snsTopicArn) => {
  try {
    //Initiate Segment detection and update value of startJobId with returned Job ID
    const segmentDetectionResponse = await rekClient.send(
      new StartSegmentDetectionCommand({
        Video: {
          S3Object: {
            Bucket: process.env["ON_DEMAND_TRANSCODED_VIDEOS_BUCKET"],
            Name: videoName,
          },
        },
        SegmentTypes: ["SHOT"],
        NotificationChannel: {
          RoleArn: roleArn,
          SNSTopicArn: snsTopicArn,
        },
      })
    );
    startJobId = segmentDetectionResponse.JobId;
    console.log(`JobID: ${startJobId}`);
    return startJobId;
  } catch (err) {
    console.log("Error", err);
  }
};

export {
  runSegmentDetectionAndGetResults,
  startSegmentDetection,
  getSegmentDetectionResults,
};
