import { useCallback, useEffect, useState } from "react";
// import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
const TemplatesList = ({ workspaceId, templateId, onChangeTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTemplates = useCallback(async () => {
    try {
      const data = await fetch(
        `${process.env.REACT_APP_EMAIL_TEMPLATE_SERVER}/service/v0/email/get/by/project/id?workspace_id=${workspaceId}`,
        {
          headers: {
            token: window.accessToken,
          },
        }
      );
      const result = await data?.json();
      setTemplates(result?.result);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    getTemplates();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Autocomplete
        options={templates}
        value={templates?.find((item) => item?._id === templateId)}
        getOptionLabel={(option) => option?.asset?.name || ""}
        textFieldProps={{
          placeholder: "Select email template",
        }}
        openOnFocus
        variant="black"
        fullWidth
        
        onChange={(e, value) => {
          onChangeTemplate(value);
          //   setBodyType(value?.value);
        }}
      />
    </>
  );
};

export default TemplatesList;
