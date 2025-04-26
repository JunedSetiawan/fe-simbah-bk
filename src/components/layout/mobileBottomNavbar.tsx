import React, { useState } from "react";
import {
  useMenu,
  useLink,
  useLogout,
  useRouterType,
  useWarnAboutChange,
  useTranslate,
} from "@refinedev/core";
import { Popover, Badge } from "antd";
import {
  HomeFilled,
  ControlFilled,
  ReadFilled,
  ContactsFilled,
  CalendarFilled,
  MoreOutlined,
  PhoneOutlined,
  TrophyFilled,
  PhoneFilled,
} from "@ant-design/icons";

export const MobileBottomNavbar: React.FC = () => {
  const { menuItems } = useMenu();
  const Link = useLink();
  const routerType = useRouterType();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const translate = useTranslate();
  const { mutate: mutateLogout } = useLogout();
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Function to handle popover visibility
  const handlePopoverVisibleChange = (visible: boolean) => {
    setPopoverVisible(visible);
  };

  // Function to close popover after menu item click
  const handleMenuItemClick = () => {
    setPopoverVisible(false);
  };

  // More menu content
  const moreMenuContent = (
    <div className="flex flex-col gap-3 py-2">
      {/* Panggilan Siswa */}
      <Link
        to="/student-calls"
        className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-md"
      >
        <PhoneFilled
          style={{ fontSize: "1.2em", color: "rgba(44, 89, 90, 1)" }}
          className="mr-2"
        />
        <span style={{ color: "rgba(44, 89, 90, 1)" }}>Panggilan Siswa</span>
      </Link>

      {/* Rekap Menu Items */}
      <Link
        to="/violation-summary/classes"
        className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-md"
        onClick={handleMenuItemClick}
      >
        <ReadFilled
          style={{ fontSize: "1.2em", color: "rgba(44, 89, 90, 1)" }}
          className="mr-2"
        />
        <span style={{ color: "rgba(44, 89, 90, 1)" }}>Rekap per Kelas</span>
      </Link>

      <Link
        to="/violation-summary/semesters"
        className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-md"
        onClick={handleMenuItemClick}
      >
        <ReadFilled
          style={{ fontSize: "1.2em", color: "rgba(44, 89, 90, 1)" }}
          className="mr-2"
        />
        <span style={{ color: "rgba(44, 89, 90, 1)" }}>Rekap per Semester</span>
      </Link>

      {/* Prestasi Ketertiban */}
      <Link
        to="/awards"
        className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-md"
        onClick={handleMenuItemClick}
      >
        <TrophyFilled
          style={{ fontSize: "1.2em", color: "rgba(44, 89, 90, 1)" }}
          className="mr-2"
        />
        <span style={{ color: "rgba(44, 89, 90, 1)" }}>
          Prestasi Ketertiban
        </span>
      </Link>
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 h-16">
      <div className="flex justify-around items-center h-full px-1">
        {/* Peraturan */}
        <Link
          to="/regulations"
          className="flex flex-col items-center justify-center w-1/5"
        >
          <ControlFilled
            style={{ fontSize: "1.5em", color: "rgba(44, 89, 90, 1)" }}
          />
          <span
            className="text-xs mt-1 text-center"
            style={{ color: "rgba(44, 89, 90, 1)" }}
          >
            Peraturan
          </span>
        </Link>

        {/* Pelanggaran */}
        <Link
          to="/violations"
          className="flex flex-col items-center justify-center w-1/5"
        >
          <ReadFilled
            style={{ fontSize: "1.5em", color: "rgba(44, 89, 90, 1)" }}
          />
          <span
            className="text-xs mt-1 text-center"
            style={{ color: "rgba(44, 89, 90, 1)" }}
          >
            Pelanggaran
          </span>
        </Link>

        {/* Dashboard (Center) */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center w-1/5"
        >
          <div className="flex items-center justify-center bg-primary rounded-full w-12 h-12 -mt-5">
            <HomeFilled style={{ fontSize: "1.8em", color: "white" }} />
          </div>
          <span
            className="text-xs mt-1 text-center"
            style={{ color: "rgba(44, 89, 90, 1)" }}
          >
            Dashboard
          </span>
        </Link>

        {/* Bimbingan Konseling */}
        <Link
          to="/counselings"
          className="flex flex-col items-center justify-center w-1/5"
        >
          <ContactsFilled
            style={{ fontSize: "1.5em", color: "rgba(44, 89, 90, 1)" }}
          />
          <span
            className="text-xs mt-1 text-center"
            style={{ color: "rgba(44, 89, 90, 1)" }}
          >
            Konseling
          </span>
        </Link>

        {/* Kunjungan Rumah */}
        <Link
          to="/home-visits"
          className="flex flex-col items-center justify-center w-1/5"
        >
          <CalendarFilled
            style={{ fontSize: "1.5em", color: "rgba(44, 89, 90, 1)" }}
          />
          <span
            className="text-xs mt-1 text-center"
            style={{ color: "rgba(44, 89, 90, 1)" }}
          >
            Kunjungan
          </span>
        </Link>
      </div>

      {/* More button (floating) */}
      <Popover
        content={moreMenuContent}
        trigger="click"
        placement="topRight"
        open={popoverVisible}
        onOpenChange={handlePopoverVisibleChange}
        overlayClassName="bottom-nav-popover"
      >
        <button
          className="absolute right-4 -top-10 bg-primary text-white rounded-full p-3 shadow-lg"
          onClick={() => setPopoverVisible(!popoverVisible)}
        >
          <MoreOutlined style={{ fontSize: "1.5em" }} />
        </button>
      </Popover>
    </div>
  );
};
