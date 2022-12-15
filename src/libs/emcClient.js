import { MediaConvertClient } from "@aws-sdk/client-mediaconvert";

// const emcClient = (endpoint) =>
//   new MediaConvertClient({
//     region: "us-east-1",
//     endpoint: endpoint,
//   });
const params = {
  endpoint: "https://lxlxpswfb.mediaconvert.us-east-1.amazonaws.com",
  region: "us-east-1",
};
const emcClient = new MediaConvertClient(params);

export { emcClient };
