import {
  CreateJobTemplateCommand,
  DeleteJobTemplateCommand,
} from "@aws-sdk/client-mediaconvert";
import { emcClient } from "./libs/emcClient.js";

const params = {
  Description: "Transform raw video into VBR format (individual segment test)",
  Category: "OnDemand Videos",
  Queue: "arn:aws:mediaconvert:us-east-1:886129056087:queues/Default",
  Name: "onDemand-auto-segmenter",
  Settings: {
    TimecodeConfig: {
      Source: "ZEROBASED",
    },
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
            Destination: `s3://ondemand-sandbox-transcoded-videos/test`,
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
    Inputs: [
      {
        InputClippings: [],
        AudioSelectors: {
          "Audio Selector 1": {
            DefaultSelection: "DEFAULT",
          },
        },
        VideoSelector: {},
        TimecodeSource: "ZEROBASED",
      },
    ],
  },
  AccelerationSettings: {
    Mode: "DISABLED",
  },
  StatusUpdateInterval: "SECONDS_60",
  Priority: 0,
  HopDestinations: [],
};

const createJobTemplate = async (inputSegment) => {
  // insert the segment to create the specific job template
  console.log("pushing ", inputSegment);
  params.Settings.Inputs[0].InputClippings = [];
  params.Settings.Inputs[0].InputClippings.push(inputSegment);
  // params.Settings.TimecodeConfig.Start = inputSegment["StartTimecode"];
  // params.Settings.Inputs[0].TimecodeStart = inputSegment["StartTimecode"];

  try {
    // Create a promise on a MediaConvert object
    // const { Endpoints } = await getEndpoint();

    // const endpoint = Endpoints[0].Url;
    // const endpoint = "https://lxlxpswfb.mediaconvert.us-east-1.amazonaws.com";
    const data = await emcClient.send(new CreateJobTemplateCommand(params));
    console.log("Success!", data);
    return data;
  } catch (err) {
    console.log("this is failing");
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
