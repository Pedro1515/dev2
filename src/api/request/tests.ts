import { apiInstance } from "src/utils";

interface PostRequest {
  id: string;
  errorStates: string[];
}

export const updateTest = async (request: PostRequest) =>
  await apiInstance.post("/rest/tests/update", request);
