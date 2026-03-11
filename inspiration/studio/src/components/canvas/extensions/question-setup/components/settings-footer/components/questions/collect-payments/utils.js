// const PAYMENT_METHOD_AND_AUTH_MAPPING = {
//   RAZORPAY: "bd592a3d-4382-4130-a1ea-6790aafe251d",
// };

const PAYMENT_METHOD_AND_AUTH_MAPPING_DEV = {
  RAZORPAY: "91c6dff3-7954-405b-a984-cbbbca0fd2df",
};

const PAYMENT_METHOD_AND_AUTH_MAPPING_PROD = {
  RAZORPAY: "bd592a3d-4382-4130-a1ea-6790aafe251d",
};

const PAYMENT_METHOD_AND_AUTH_MAPPING =
  process.env.ENV === "production"
    ? PAYMENT_METHOD_AND_AUTH_MAPPING_PROD
    : PAYMENT_METHOD_AND_AUTH_MAPPING_DEV;

const getAuthorizations = async ({ paymentMethod, workspaceId }) => {
  try {
    const authId = PAYMENT_METHOD_AND_AUTH_MAPPING[paymentMethod];
    let response = await fetch(
      `${process.env.REACT_APP_OUTE_SERVER}/service/v0/authorized/data/by/parent?authorization_id=${authId}&workspace_id=${workspaceId}&state=ACTIVE`,
      {
        method: "GET",
        headers: {
          token: window.accessToken,
        },
      }
    );
    response = await response.json();
    if (response?.status !== "success") {
      throw "Something went wrong";
    }
    const auths = response?.result?.map((auth) => ({
      label: auth?.name,
      value: auth?._id,
    }));
    return auths;
  } catch (e) {
    return [];
  }
};

export { PAYMENT_METHOD_AND_AUTH_MAPPING, getAuthorizations };
