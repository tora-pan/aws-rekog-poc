import {
  CreateJobTemplateCommand,
  DeleteJobTemplateCommand,
} from "@aws-sdk/client-mediaconvert";
import { emcClient } from "./libs/emcClient.js";

const defaultQue = process.env["AWS_ELEMENTAL_MEDIACONVERT_DEFAULT_QUE_ARN"];
const mediaConvertRole = process.env["AWS_ELEMENTAL_MEDIACONVERT_JOB_ROLE_ARN"];

const createJobTemplate = async (inputSegment, fileName) => {
  const params = {
    Description:
      "Transform raw video into VBR format (individual segment test)",
    Category: "OnDemand Videos",
    Queue: defaultQue,
    Role: mediaConvertRole,
    Name: "onDemand-auto-segmenter",
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
          InputClippings: [],
          FilterEnable: "AUTO",
          PsiControl: "USE_PSI",
          FilterStrength: 0,
          DeblockFilter: "DISABLED",
          DenoiseFilter: "DISABLED",
          TimecodeSource: "ZEROBASED",
          FileInput: `s3://${process.env["ON_DEMAND_TRANSCODED_VIDEOS_BUCKET"]}/${process.env["ON_DEMAND_VIDEO_FILE_NAME"]}`,
        },
      ],

      OutputGroups: [
        {
          Name: "Apple HLS",
          Outputs: [
            {
              ContainerSettings: {
                Container: "M3U8",
                M3u8Settings: {},
              },
              VideoDescription: {
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    MaxBitrate: 5000000,
                    Bitrate: 1000000,
                    RateControlMode: "VBR",
                  },
                },
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 96000,
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                    },
                  },
                },
              ],
              OutputSettings: {
                HlsSettings: {},
              },
              NameModifier: "-vbr",
            },
          ],
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: {
              SegmentLength: 1000,
              Destination: `s3://ondemand-sandbox-transcoded-videos/test/${fileName}`,
              DestinationSettings: {
                S3Settings: {
                  AccessControl: {
                    CannedAcl: "BUCKET_OWNER_FULL_CONTROL",
                  },
                },
              },
              MinSegmentLength: 10,
              SegmentControl: "SINGLE_FILE",
            },
          },
        },
      ],
    },
    TimecodeConfig: {
      Source: "ZEROBASED",
    },
    AccelerationSettings: {
      Mode: "DISABLED",
    },
    StatusUpdateInterval: "SECONDS_60",
    Priority: 0,
    HopDestinations: [],
  };
  // insert the segment to create the specific job template
  console.log("pushing ", inputSegment);
  params.Settings.Inputs[0].InputClippings = [];
  params.Settings.Inputs[0].InputClippings.push(inputSegment);

  try {
    const data = await emcClient.send(new CreateJobTemplateCommand(params));
    return data;
  } catch (err) {
    console.log(err);
  }
};

const deleteJobTemplate = async (templateName) => {
  const params = {
    Name: templateName,
  };
  try {
    const data = await emcClient.send(new DeleteJobTemplateCommand(params));
    console.log(
      "Success, template deleted! Request ID:",
      data.$metadata.requestId
    );
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

export { createJobTemplate, deleteJobTemplate };
