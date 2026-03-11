import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  ODSAvatar,
  ODSLabel,
  ODSIcon,
  ODSContextMenu,
  serverConfig,
} from "@src/module/ods";
import { getInitials } from "./utils";
import userServices from "./sdk-services/user-sdk-services";

interface UserData {
  first_name?: string;
  last_name?: string;
  bg_color?: string;
  meta?: {
    thumbnail?: string;
  };
}

interface ContextMenuCoords {
  left: number;
  top: number;
}

interface MenuDataItem {
  id: string;
  name: React.ReactNode | string;
  onClick: () => void;
  leftAdornment?: React.ReactNode;
  divider?: boolean;
  className?: string;
  destructive?: boolean;
}

interface CommonAccountActionsProps {
  avatarProps?: {
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  };
}

interface CommonAccountActionsRef {
  refreshUserData: () => Promise<void>;
}

export const CommonAccountActions = forwardRef<
  CommonAccountActionsRef,
  CommonAccountActionsProps
>(({ avatarProps = {} }, ref) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [contextMenuCoords, setContextMenuCoords] =
    useState<ContextMenuCoords | null>(null);

  const getUserInfo = async (): Promise<void> => {
    const userInfo = await userServices.authUserInfo();
    setUserData(userInfo?.result);
  };

  const navigateOrOpen = (path: string): void => {
    window.open(`${serverConfig.WC_LANDING_URL}/redirect?r=${path}`, "_self");
  };

  const menuData: MenuDataItem[] = [
    {
      id: "profile",
      name: (
        <ODSLabel variant="body1" data-testid="my-account">
          My Account
        </ODSLabel>
      ),
      onClick: () => navigateOrOpen("account"),
      leftAdornment: (
        <ODSIcon
          outeIconName="OUTEMemberIcon"
          outeIconProps={{
            style: {
              width: "1rem",
              height: "1rem",
              color: "#90a4ae",
            },
          }}
        />
      ),
    },
    {
      id: "referralAndCredits",
      name: (
        <ODSLabel variant="body1" data-testid="referral-and-credits">
          Referral & Credits
        </ODSLabel>
      ),
      onClick: () => navigateOrOpen("referral"),
      leftAdornment: (
        <ODSIcon
          outeIconName="OUTEHandshakeIcon"
          outeIconProps={{
            style: {
              width: "1rem",
              height: "1rem",
              color: "#90a4ae",
            },
          }}
        />
      ),
      divider: true,
    },
    {
      id: "logout",
      name: "Logout",
      onClick: () => navigateOrOpen("logout"),
      leftAdornment: (
        <ODSIcon
          outeIconName="OUTELogoutIcon"
          outeIconProps={{ 
            style: { 
              width: "1rem",
              height: "1rem",
              color: "#d32f2f" 
            } 
          }}
        />
      ),
      destructive: true,
    },
  ];

  const handleAvatarClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!menuData.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuCoords({
      left: rect.left,
      top: rect.bottom + 8,
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      refreshUserData: getUserInfo,
    }),
    []
  );

  const isEmbedMode = typeof window !== "undefined" && window.location.pathname === "/embed";

  useEffect(() => {
    if (isEmbedMode) return;
    getUserInfo();
  }, []);

  return (
    <div
      className="cursor-pointer"
      onClick={handleAvatarClick}
      data-testid="header-avatar"
    >
      <ODSAvatar
        avatarProps={{
          ...avatarProps,
          className:
            "w-8 h-8 text-sm border-[0.75px] border-[#cfd8dc] rounded-md p-0",
          style: {
            backgroundColor: userData?.bg_color || "#358cff",
            ...(avatarProps?.style || {}),
          },
        }}
        data-testid={"user-avatar"}
      >
        <div className="flex items-center p-px justify-center w-full h-full rounded-full">
          {!userData ? (
            <ODSIcon outeIconName="OUTEMemberIcon" />
          ) : userData?.meta?.thumbnail ? (
            <ODSIcon
              imageProps={{
                src: userData?.meta?.thumbnail,
                "data-testid": "user-avatar-icon",
                width: "100%",
                height: "100%",
              }}
            />
          ) : (
            getInitials(`${userData?.first_name} ${userData?.last_name}`)
          )}
        </div>
      </ODSAvatar>
      <ODSContextMenu
        show={!!contextMenuCoords}
        menus={menuData}
        coordinates={contextMenuCoords}
        onClose={() => {
          setContextMenuCoords(null);
        }}
      />
    </div>
  );
});

CommonAccountActions.displayName = "CommonAccountActions";

export default CommonAccountActions;
