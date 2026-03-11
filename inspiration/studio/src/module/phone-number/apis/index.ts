import axios from "axios";
import { serverConfig } from "@src/module/ods";
import { toast } from "sonner";

// Hardcode this for now as Satendra is telling its local server
// need to discuss with Ankit
const API_BASE_URL = "https://consumer.digihealth.in";

const API_URLS = {
  sendOtp: `${serverConfig.OUTE_SERVER}/service/v0/sms/generate/auth-code`,
  verifyOtp: `${serverConfig.OUTE_SERVER}/service/v0/sms/verify/auth-code`,
};

// Ensure E.164 format: + followed by digits only (strips dashes, spaces, etc.)
const toE164 = (phone: string) => {
  if (!phone || typeof phone !== "string") return phone;
  const digits = phone.replace(/\D/g, "");
  return phone.trim().startsWith("+") ? `+${digits}` : digits;
};

const sendOtp = async ({ phone, onSuccess, requestTimestamp }) => {
  try {
    const normalizedPhone = toE164(phone);
    const { data } = await axios.post(
      `${API_URLS.sendOtp}`,
      {
        identity: normalizedPhone,
        request_id: requestTimestamp,
      },
      {
        headers: {
          token: window.accessToken,
        },
      }
    );
    if (data?.status === "success" && onSuccess) {
      onSuccess(data);
    }
    return data;
  } catch (e) {
    toast.error("OTP Error", {
      description: JSON.stringify(e),
    });
    return e;
  }
};

const verifyOtp = async ({ phone, otp, requestTimestamp }) => {
  try {
    if (!otp) {
      return {
        status: false,
        message: "Please enter verification code",
      };
    }
    if (otp?.length !== 6) {
      return {
        status: false,
        message: "Please enter a valid verification code",
      };
    }
    const { data } = await axios.post(
      API_URLS.verifyOtp,
      {
        identity: toE164(phone),
        code: otp,
        request_id: requestTimestamp,
      },
      {
        headers: {
          token: window.accessToken,
        },
      }
    );
    if (data?.status !== "success") {
      return {
        status: false,
        message: "Invalid verification code",
      };
    }
    return {
      status: true,
      message: "Verification successful",
    };
  } catch (e) {
    return {
      status: false,
      message: "Invalid verification code",
    };
  }
};

export { sendOtp, verifyOtp };
