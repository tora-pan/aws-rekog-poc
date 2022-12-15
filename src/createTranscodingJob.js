// Load the AWS SDK for Node.js
import AWS from "aws-sdk";
import { deleteJobTemplate } from "./createJobTemplate.js";
// Set the Region
AWS.config.update({ region: "us-east-1" });
// Set the custom endpoint for your account
AWS.config.mediaconvert = {
  endpoint: "https://lxlxpswfb.mediaconvert.us-east-1.amazonaws.com",
};

const createTranscodingJob = async (jobTemplate) => {
  const { Name } = jobTemplate;
  const params = {
    Queue: process.env["AWS_MEDIA_CONVERT_DEFAULT_QUE_ARN"],
    JobTemplate: Name,
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
          FileInput: `s3://${process.env["ON_DEMAND_TRANSCODED_VIDEOS_BUCKET"]}/${process.env["ON_DEMAND_VIDEO_FILE_NAME"]}`,
        },
      ],
      // OutputGroups: [
      //   {
      //     OutputGroupSettings: {
      //       HlsGroupSettings: {
      //         Destination: `s3://ondemand-sandbox-transcoded-videos/test/${fileName}`,
      //       },
      //     },
      //   },
      // ],
    },
  };
  // const params = {
  //   Queue: process.env["AWS_ELEMENTAL_MEDIACONVERT_DEFAULT_QUE_ARN"],
  //   JobTemplate: "onDemand-auto-segmenter",
  //   // templateData.JobTemplate.Name |
  //   // process.env["AWS_ELEMENTAL_MEDIACONVERT_JOB_TEMPLATE_NAME"],
  //   Role: process.env["AWS_ELEMENTAL_MEDIACONVERT_JOB_ROLE_ARN"],

  // };
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
