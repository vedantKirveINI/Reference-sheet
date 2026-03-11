import axios from "axios";
import { toast } from "sonner";
import { serverConfig } from "@src/module/ods";

interface SendOtpProps {
  email: string;
  onSuccess: () => void;
  requestTimestamp: number;
}

interface VerifyOtpProps {
  email: string;
  otp: string;
  requestTimestamp: number;
}

const API_URLS = {
  sendOtp: `${process.env.REACT_APP_MAILER_SERVER_URL}/service/v0/mailer/generate/auth-code`,
  verifyOtp: `${process.env.REACT_APP_MAILER_SERVER_URL}/service/v0/mailer/verify/auth-code`,
};

const sendOtp = async ({
  email,
  onSuccess,
  requestTimestamp,
}: SendOtpProps) => {
  try {
    const { data } = await axios.post(
      API_URLS.sendOtp,
      {
        identity: email,
        request_id: requestTimestamp,
      },
      {
        headers: {
          token: window.accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (data?.status === "success" && onSuccess) {
      onSuccess();
    }
    return data;
  } catch (e) {
    toast.error("Email OTP Error", {
      description: "Failed to send OTP",
    });
    return e;
  }
};

const verifyOtp = async ({ email, otp, requestTimestamp }: VerifyOtpProps) => {
  try {
    if (!otp) {
      return {
        status: false,
        message: "Please enter verification code",
      };
    }
    if (otp?.length !== 4) {
      return {
        status: false,
        message: "Please enter a valid verification code",
      };
    }
    const { data } = await axios.post(
      API_URLS.verifyOtp,
      {
        identity: email,
        code: otp,
        request_id: requestTimestamp,
      },
      {
        headers: {
          token: window.accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (data?.status !== "success") {
      throw {
        status: false,
        message: "Invalid verification code",
      };
    }
    return {
      status: true,
      message: "Verification successful",
    };

    // if (data?.status === 'success' && onSuccess) {
    //   onSuccess();
    // }
    // return data;
  } catch (e) {
    // showAlert({ type: "error", message: "Failed to verify verification codes" });
    return {
      status: false,
      message: "Invalid verification code",
    };
  }
};

export { sendOtp, verifyOtp };
