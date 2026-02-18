import { showAlert } from "@/lib/toast";
import Papa from "papaparse";

import useRequest from "../../../../../../hooks/useRequest";
import truncateName from "../../../../../../utils/truncateName";

const useFetchAndParseCsv = () => {
        const [{ data, error, loading: requestLoading }, trigger] = useRequest(
                {
                        method: "GET",
                        responseType: "blob", // Get the file as a blob for parsing
                },
                { manual: true },
        );

        const fetchFileData = async ({ url }) => {
                try {
                        const response = await trigger({ url });

                        // Return a promise that resolves with the parsed data
                        return new Promise((resolve, reject) => {
                                Papa.parse(response?.data, {
                                        header: false, // Set to true if your CSV has headers
                                        skipEmptyLines: true,
                                        complete: (result) => {
                                                resolve(result.data); // Resolve the promise with the parsed data
                                        },
                                        error: (parseError) => {
                                                reject(parseError); // Reject the promise on error
                                        },
                                });
                        });
                } catch (err) {
                        showAlert({
                                type: "error",
                                message: `${
                                        truncateName(error?.response?.data?.message, 50) ||
                                        "Could not fetch file"
                                }`,
                        });
                }
        };

        return { fetchFileData, data, requestLoading, error };
};

export default useFetchAndParseCsv;
