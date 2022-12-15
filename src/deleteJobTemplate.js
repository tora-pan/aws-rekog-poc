import { DeleteJobTemplateCommand } from "@aws-sdk/client-mediaconvert";
import { emcClient } from "./libs/emcClient.js";

// Set the parameters

const deleteJobTemplate = async (templateName) => {
  const params = { Name: templateName };
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
export { deleteJobTemplate };
