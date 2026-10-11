import { Menu, Search, Bell, ChevronDown, UserCircle } from "lucide-react";

function Topbar({ user }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu">
          <Menu size={25} />
        </button>

        <div className="search-box">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search hospitals, blood groups, requests, or donors..."
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-notification">
          <Bell size={23} />
          <span>3</span>
        </button>

        <div className="topbar-divider" />

        <div className="profile">
          <div className="profile-avatar">
            <UserCircle size={34} />
          </div>

          <div className="profile-info">
            <strong>{user?.name || "User"}</strong>

            <span>{user?.role || "User"}</span>
          </div>

          <ChevronDown size={17} className="profile-arrow" />
        </div>
      </div>
    </header>
  );
}

export default Topbar;
