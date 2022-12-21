import {
  CreateTopicCommand,
  DeleteTopicCommand,
  SNSClient,
  SubscribeCommand,
} from "@aws-sdk/client-sns";
import {
  CreateQueueCommand,
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  SetQueueAttributesCommand,
  DeleteQueueCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

import { stdout } from "process";

import AWS from "aws-sdk";
AWS.config.update({ region: "us-east-1" });

const sqsClient = new SQSClient({
  region: "us-east-1",
});
const snsClient = new SNSClient({
  region: "us-east-1",
});


const ts = Date.now();
const snsTopicName = "AmazonRekognitionExample" + ts;
const snsTopicParams = { Name: snsTopicName };
const sqsQueueName = "AmazonRekognitionQueue-" + ts;

// Set the parameters
const sqsParams = {
  QueueName: sqsQueueName,
  Attributes: {
    DelaySeconds: "60",
    MessageRetentionPeriod: "86400",
  },
};

// Checks for status of job completion
const getSQSMessageSuccess = async (sqsQueueUrl, startJobId) => {
  try {
    // Set job found and success status to false initially
    let jobFound = false;
    let succeeded = false;
    let dotLine = 0;
    // while not found, continue to poll for response
    while (jobFound == false) {
      let sqsReceivedResponse = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: sqsQueueUrl,
          MaxNumberOfMessages: "ALL",
          MaxNumberOfMessages: 10,
        })
      );
      if (sqsReceivedResponse) {
        let responseString = JSON.stringify(sqsReceivedResponse);
        if (!responseString.includes("Body")) {
          if (dotLine < 40) {
            console.log(".");
            dotLine = dotLine + 1;
          } else {
            console.log("");
            dotLine = 0;
          }
          stdout.write("", () => {
            console.log("");
          });
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
      }

      // Once job found, log Job ID and return true if status is succeeded
      for (let message of sqsReceivedResponse.Messages) {
        console.log("Retrieved messages:");
        let notification = JSON.parse(message.Body);
        let rekMessage = JSON.parse(notification.Message);
        let messageJobId = rekMessage.JobId;
        if (String(messageJobId).includes(String(startJobId))) {
          console.log("Matching job found:");
          console.log(rekMessage.JobId);
          jobFound = true;
          console.log(rekMessage.Status);
          if (String(rekMessage.Status).includes(String("SUCCEEDED"))) {
            succeeded = true;
            console.log("Job processing succeeded.");
            let sqsDeleteMessage = await sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: sqsQueueUrl,
                ReceiptHandle: message.ReceiptHandle,
              })
            );
          }
        } else {
          console.log("Provided Job ID did not match returned ID.");
          let sqsDeleteMessage = await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: sqsQueueUrl,
              ReceiptHandle: message.ReceiptHandle,
            })
          );
        }
      }
    }
    return succeeded;
  } catch (err) {
    console.log("Error", err);
  }
};

const createTopicandQueue = async () => {
  console.log("createTopicandQueue");
  try {
    // Create SNS topic
    const topicResponse = await snsClient.send(
      new CreateTopicCommand(snsTopicParams)
    );
    const topicArn = topicResponse.TopicArn;
    console.log("Success", topicResponse);
    // Create SQS Queue
    const sqsResponse = await sqsClient.send(new CreateQueueCommand(sqsParams));
    console.log("Success", sqsResponse);
    const sqsQueueCommand = await sqsClient.send(
      new GetQueueUrlCommand({ QueueName: sqsQueueName })
    );
    const sqsQueueUrl = sqsQueueCommand.QueueUrl;
    const attribsResponse = await sqsClient.send(
      new GetQueueAttributesCommand({
        QueueUrl: sqsQueueUrl,
        AttributeNames: ["QueueArn"],
      })
    );
    const attribs = attribsResponse.Attributes;
    console.log(attribs);
    const queueArn = attribs.QueueArn;

    // subscribe SQS queue to SNS topic
    const subscribed = await snsClient.send(
      new SubscribeCommand({
        TopicArn: topicArn,
        Protocol: "sqs",
        Endpoint: queueArn,
      })
    );
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "MyPolicy",
          Effect: "Allow",
          Principal: { AWS: "*" },
          Action: "SQS:SendMessage",
          Resource: queueArn,
          Condition: {
            ArnEquals: {
              "aws:SourceArn": topicArn,
            },
          },
        },
      ],
    };

    const response = sqsClient.send(
      new SetQueueAttributesCommand({
        QueueUrl: sqsQueueUrl,
        Attributes: { Policy: JSON.stringify(policy) },
      })
    );
    console.log(response);
    console.log(sqsQueueUrl, topicArn);
    return [sqsQueueUrl, topicArn];
  } catch (err) {
    console.log("Error", err);
  }
};

const deleteQueue = async (sqsAndTopic) =>
  await sqsClient.send(new DeleteQueueCommand({ QueueUrl: sqsAndTopic[0] }));

const deleteTopic = async (sqsAndTopic) =>
  await snsClient.send(new DeleteTopicCommand({ TopicArn: sqsAndTopic[1] }));

export { createTopicandQueue, deleteQueue, deleteTopic, getSQSMessageSuccess };
