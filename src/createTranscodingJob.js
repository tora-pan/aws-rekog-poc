// Load the AWS SDK for Node.js
import AWS from "aws-sdk";
import { deleteJobTemplate } from "./createJobTemplate.js";
// Set the Region
AWS.config.update({ region: "us-east-1" });
// Set the custom endpoint for your account
AWS.config.mediaconvert = {
  endpoint: "https://lxlxpswfb.mediaconvert.us-east-1.amazonaws.com",
};

const createTranscodingJob = async (templateData, fileName, startTime) => {
  const params = {
    Queue: process.env["AWS_ELEMENTAL_MEDIACONVERT_DEFAULT_QUE_ARN"],
    JobTemplate: "onDemand-auto-segmenter",
    // templateData.JobTemplate.Name |
    // process.env["AWS_ELEMENTAL_MEDIACONVERT_JOB_TEMPLATE_NAME"],
    Role: process.env["AWS_ELEMENTAL_MEDIACONVERT_JOB_ROLE_ARN"],
    Settings: {
      Inputs: [
        {
          AudioSelectors: {
            "Audio Selector 1": {
              Offset: 0,
              DefaultSelection: "NOT_DEFAULT",
              ProgramSelection: 1,
              SelectorType: "TRACK",
              Tracks: [1],
            },
          },
          VideoSelector: {
            ColorSpace: "FOLLOW",
          },
          FilterEnable: "AUTO",
          PsiControl: "USE_PSI",
          FilterStrength: 0,
          DeblockFilter: "DISABLED",
          DenoiseFilter: "DISABLED",
          TimecodeSource: "ZEROBASED",
          FileInput: `s3://${process.env["ON_DEMAND_TRANSCODED_VIDEOS_BUCKET"]}/001-720-FOR308-F03-04-1-0ef39234-3730-4ab3-af1c-49fe482c95b6.mp4`,
        },
      ],
      OutputGroups: [
        {
          OutputGroupSettings: {
            HlsGroupSettings: {
              Destination: `s3://ondemand-sandbox-transcoded-videos/test/${fileName}`,
            },
          },
        },
      ],
    },
  };
  try {
    const result = await new AWS.MediaConvert({
      apiVersion: "2017-08-29",
    })
      .createJob(params)
      .promise();
    return result;
  } catch (err) {
    console.log(err);
  }
};

export { createTranscodingJob };
