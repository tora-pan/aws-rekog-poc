import { createJobTemplate, deleteJobTemplate } from "./createJobTemplate.js";
import { createTranscodingJob } from "./createTranscodingJob.js";
import { runSegmentDetectionAndGetResults } from "./autoDetect.js";

import dotenv from "dotenv";
import { runTextDetectionAndGetResults } from "./autoDetectText.js";
dotenv.config();

const dummyData = [
  {
    DurationFrames: 340,
    DurationMillis: 14166,
    DurationSMPTE: "00:00:14:04",
    EndFrameNumber: 340,
    EndTimecodeSMPTE: "00:00:14:04",
    EndTimestampMillis: 14166,
    ShotSegment: { Confidence: 99.80281829833984, Index: 0 },
    StartFrameNumber: 0,
    StartTimecodeSMPTE: "00:00:00:00",
    StartTimestampMillis: 0,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 917,
    DurationMillis: 38208,
    DurationSMPTE: "00:00:38:05",
    EndFrameNumber: 1258,
    EndTimecodeSMPTE: "00:00:52:10",
    EndTimestampMillis: 52416,
    ShotSegment: { Confidence: 99.5933609008789, Index: 1 },
    StartFrameNumber: 341,
    StartTimecodeSMPTE: "00:00:14:05",
    StartTimestampMillis: 14208,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 273,
    DurationMillis: 11375,
    DurationSMPTE: "00:00:11:09",
    EndFrameNumber: 1532,
    EndTimecodeSMPTE: "00:01:03:20",
    EndTimestampMillis: 63833,
    ShotSegment: { Confidence: 99.5933609008789, Index: 2 },
    StartFrameNumber: 1259,
    StartTimecodeSMPTE: "00:00:52:11",
    StartTimestampMillis: 52458,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 1834,
    DurationMillis: 76416,
    DurationSMPTE: "00:01:16:10",
    EndFrameNumber: 3367,
    EndTimecodeSMPTE: "00:02:20:07",
    EndTimestampMillis: 140291,
    ShotSegment: { Confidence: 98.78385925292969, Index: 3 },
    StartFrameNumber: 1533,
    StartTimecodeSMPTE: "00:01:03:21",
    StartTimestampMillis: 63875,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 3511,
    DurationMillis: 146292,
    DurationSMPTE: "00:02:26:07",
    EndFrameNumber: 6879,
    EndTimecodeSMPTE: "00:04:46:15",
    EndTimestampMillis: 286625,
    ShotSegment: { Confidence: 98.78385925292969, Index: 4 },
    StartFrameNumber: 3368,
    StartTimecodeSMPTE: "00:02:20:08",
    StartTimestampMillis: 140333,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 2986,
    DurationMillis: 124417,
    DurationSMPTE: "00:02:04:10",
    EndFrameNumber: 9866,
    EndTimecodeSMPTE: "00:06:51:02",
    EndTimestampMillis: 411083,
    ShotSegment: { Confidence: 97.7314224243164, Index: 5 },
    StartFrameNumber: 6880,
    StartTimecodeSMPTE: "00:04:46:16",
    StartTimestampMillis: 286666,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 2865,
    DurationMillis: 119375,
    DurationSMPTE: "00:01:59:09",
    EndFrameNumber: 12732,
    EndTimecodeSMPTE: "00:08:50:12",
    EndTimestampMillis: 530500,
    ShotSegment: { Confidence: 97.7314224243164, Index: 6 },
    StartFrameNumber: 9867,
    StartTimecodeSMPTE: "00:06:51:03",
    StartTimestampMillis: 411125,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 276,
    DurationMillis: 11500,
    DurationSMPTE: "00:00:11:12",
    EndFrameNumber: 13009,
    EndTimecodeSMPTE: "00:09:02:01",
    EndTimestampMillis: 542041,
    ShotSegment: { Confidence: 99.50664520263672, Index: 7 },
    StartFrameNumber: 12733,
    StartTimecodeSMPTE: "00:08:50:13",
    StartTimestampMillis: 530541,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 1278,
    DurationMillis: 53250,
    DurationSMPTE: "00:00:53:06",
    EndFrameNumber: 14288,
    EndTimecodeSMPTE: "00:09:55:08",
    EndTimestampMillis: 595333,
    ShotSegment: { Confidence: 96.2174072265625, Index: 8 },
    StartFrameNumber: 13010,
    StartTimecodeSMPTE: "00:09:02:02",
    StartTimestampMillis: 542083,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 2215,
    DurationMillis: 92291,
    DurationSMPTE: "00:01:32:07",
    EndFrameNumber: 16504,
    EndTimecodeSMPTE: "00:11:27:16",
    EndTimestampMillis: 687666,
    ShotSegment: { Confidence: 96.2174072265625, Index: 9 },
    StartFrameNumber: 14289,
    StartTimecodeSMPTE: "00:09:55:09",
    StartTimestampMillis: 595375,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 320,
    DurationMillis: 13333,
    DurationSMPTE: "00:00:13:08",
    EndFrameNumber: 16825,
    EndTimecodeSMPTE: "00:11:41:01",
    EndTimestampMillis: 701041,
    ShotSegment: { Confidence: 99.31026458740234, Index: 10 },
    StartFrameNumber: 16505,
    StartTimecodeSMPTE: "00:11:27:17",
    StartTimestampMillis: 687708,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 4150,
    DurationMillis: 172917,
    DurationSMPTE: "00:02:52:22",
    EndFrameNumber: 20976,
    EndTimecodeSMPTE: "00:14:34:00",
    EndTimestampMillis: 874000,
    ShotSegment: { Confidence: 99.7817153930664, Index: 11 },
    StartFrameNumber: 16826,
    StartTimecodeSMPTE: "00:11:41:02",
    StartTimestampMillis: 701083,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 251,
    DurationMillis: 10459,
    DurationSMPTE: "00:00:10:11",
    EndFrameNumber: 21228,
    EndTimecodeSMPTE: "00:14:44:12",
    EndTimestampMillis: 884500,
    ShotSegment: { Confidence: 99.50848388671875, Index: 12 },
    StartFrameNumber: 20977,
    StartTimecodeSMPTE: "00:14:34:01",
    StartTimestampMillis: 874041,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 3642,
    DurationMillis: 151750,
    DurationSMPTE: "00:02:31:18",
    EndFrameNumber: 24871,
    EndTimecodeSMPTE: "00:17:16:07",
    EndTimestampMillis: 1036291,
    ShotSegment: { Confidence: 99.50848388671875, Index: 13 },
    StartFrameNumber: 21229,
    StartTimecodeSMPTE: "00:14:44:13",
    StartTimestampMillis: 884541,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 257,
    DurationMillis: 10708,
    DurationSMPTE: "00:00:10:17",
    EndFrameNumber: 25129,
    EndTimecodeSMPTE: "00:17:27:01",
    EndTimestampMillis: 1047041,
    ShotSegment: { Confidence: 99.6265640258789, Index: 14 },
    StartFrameNumber: 24872,
    StartTimecodeSMPTE: "00:17:16:08",
    StartTimestampMillis: 1036333,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 2406,
    DurationMillis: 100250,
    DurationSMPTE: "00:01:40:06",
    EndFrameNumber: 27536,
    EndTimecodeSMPTE: "00:19:07:08",
    EndTimestampMillis: 1147333,
    ShotSegment: { Confidence: 99.6265640258789, Index: 15 },
    StartFrameNumber: 25130,
    StartTimecodeSMPTE: "00:17:27:02",
    StartTimestampMillis: 1047083,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 3039,
    DurationMillis: 126625,
    DurationSMPTE: "00:02:06:15",
    EndFrameNumber: 30576,
    EndTimecodeSMPTE: "00:21:14:00",
    EndTimestampMillis: 1274000,
    ShotSegment: { Confidence: 97.37557220458984, Index: 16 },
    StartFrameNumber: 27537,
    StartTimecodeSMPTE: "00:19:07:09",
    StartTimestampMillis: 1147375,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 119,
    DurationMillis: 4959,
    DurationSMPTE: "00:00:04:23",
    EndFrameNumber: 30696,
    EndTimecodeSMPTE: "00:21:19:00",
    EndTimestampMillis: 1279000,
    ShotSegment: { Confidence: 97.37557220458984, Index: 17 },
    StartFrameNumber: 30577,
    StartTimecodeSMPTE: "00:21:14:01",
    StartTimestampMillis: 1274041,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 2996,
    DurationMillis: 124833,
    DurationSMPTE: "00:02:04:20",
    EndFrameNumber: 33695,
    EndTimecodeSMPTE: "00:23:23:23",
    EndTimestampMillis: 1403958,
    ShotSegment: { Confidence: 98.83164978027344, Index: 18 },
    StartFrameNumber: 30699,
    StartTimecodeSMPTE: "00:21:19:03",
    StartTimestampMillis: 1279125,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
  {
    DurationFrames: 128,
    DurationMillis: 5333,
    DurationSMPTE: "00:00:05:08",
    EndFrameNumber: 33827,
    EndTimecodeSMPTE: "00:23:29:11",
    EndTimestampMillis: 1409458,
    ShotSegment: { Confidence: 99.49725341796875, Index: 19 },
    StartFrameNumber: 33699,
    StartTimecodeSMPTE: "00:23:24:03",
    StartTimestampMillis: 1404125,
    TechnicalCueSegment: undefined,
    Type: "SHOT",
  },
];

const simulateDataFetching = () => {
  let count = 0;
  let loading = "fetching data";
  let interval = setInterval(() => {
    console.log(loading);
    if (count < 5) {
      loading += " .";
      count++;
    } else {
      clearInterval(interval);
      createMediaConvertSegmentedTemplate();
    }
  }, 1000);
};

const msToTime = (s) => {
  // Pad to 2 or 3 digits, default is 2
  const pad = (n, z) => {
    z = z || 2;
    return ("00" + n).slice(-z);
  };

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  // return pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + ":" + pad(ms);
  return pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + ":00";
};

const getTextFromVideo = async () => {
  const results = await runTextDetectionAndGetResults();
  // console.log({ results });
  console.log('coming from getTextFromVideo function call')

  // send to input clippings
  for (let segment in results) {
    let timecodeStart = msToTime(results[segment].timeStamps.start);
    let timecodeEnd = msToTime(results[segment].timeStamps.end);
    let newSegment = {
      "StartTimecode": timecodeStart,
      "EndTimecode": timecodeEnd,
    };
    try {
      const createdTemplate = await createJobTemplate(
        newSegment,
        results[segment].curSlide
      );
      console.log(`created template with`, newSegment);
      await createTranscodingJob(createdTemplate.JobTemplate);
      console.log("created the job");
      await deleteJobTemplate(createdTemplate?.JobTemplate.Name);
      console.log("deleted the template");
    } catch (err) {
      console.log(err);
    }
  }

  console.log(results);
};

const createMediaConvertSegmentedTemplate = async () => {
  const results = await runSegmentDetectionAndGetResults();
  for (let i = 0; i < results.length; i++) {
    let newSegment = {
      "StartTimecode": results[i].StartTimecodeSMPTE,
      "EndTimecode": results[i].EndTimecodeSMPTE,
    };
    let fileName = `slide ${i + 1}`;
    try {
      const createdTemplate = await createJobTemplate(newSegment, fileName);
      console.log(`created template with`, newSegment);
      await createTranscodingJob(createdTemplate.JobTemplate);
      console.log("created the job");
      await deleteJobTemplate(createdTemplate?.JobTemplate.Name);
    } catch (err) {
      console.log(err);
    }
  }
};

// simulateDataFetching();
// createMediaConvertSegmentedTemplate();
getTextFromVideo();
