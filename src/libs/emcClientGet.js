import { MediaConvertClient } from "@aws-sdk/client-mediaconvert";
// Set the AWS Region.
const REGION = "us-east-1";
//Set the MediaConvert Service Object
const emcClientGet = new MediaConvertClient({
  region: "us-east-1",
});
export { emcClientGet };
