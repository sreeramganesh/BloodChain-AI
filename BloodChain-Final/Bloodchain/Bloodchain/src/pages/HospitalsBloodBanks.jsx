import {
  Building2,
  Droplets,
  MapPin,
  Users,
  Search,
  RotateCcw,
  Download,
  ChevronDown,
  Eye,
  Plus,
  ShieldCheck,
  ArrowRight,
  Phone,
  Navigation,
} from "lucide-react";

const institutions = [
  {
    id: 1,
    name: "Trichy Government Hospital",
    type: "Hospital",
    location: "Trichy",
    distance: "0.8 km",
    groups: "A+, O+, B+, AB+",
    status: "Active",
  },
  {
    id: 2,
    name: "Trichy Blood Bank",
    type: "Blood Bank",
    location: "Trichy",
    distance: "1.2 km",
    groups: "A+, A-, O+, O-, B+",
    status: "Active",
  },
  {
    id: 3,
    name: "SRM Hospital",
    type: "Hospital",
    location: "Trichy",
    distance: "5.6 km",
    groups: "A+, O+, B+, AB-",
    status: "Active",
  },
  {
    id: 4,
    name: "Cauvery Hospital",
    type: "Hospital",
    location: "Trichy",
    distance: "6.1 km",
    groups: "O+, B+, B-, AB+",
    status: "Active",
  },
  {
    id: 5,
    name: "Apollo Hospital",
    type: "Hospital",
    location: "Trichy",
    distance: "7.4 km",
    groups: "A+, O+, O-",
    status: "Active",
  },
  {
    id: 6,
    name: "MGM Hospital",
    type: "Hospital",
    location: "Trichy",
    distance: "8.2 km",
    groups: "A+, B+, AB+, O+",
    status: "Active",
  },
  {
    id: 7,
    name: "Thillai Nagar Blood Bank",
    type: "Blood Bank",
    location: "Trichy",
    distance: "9.1 km",
    groups: "O+, O-, A+, B+",
    status: "Active",
  },
  {
    id: 8,
    name: "Kauvery Hospital",
    type: "Hospital",
    location: "Trichy",
    distance: "10.4 km",
    groups: "A+, B+, O+, AB+",
    status: "Active",
  },
  {
    id: 9,
    name: "Govt. Medical College",
    type: "Hospital",
    location: "Trichy",
    distance: "11.6 km",
    groups: "A+, A-, O+, B+",
    status: "Active",
  },
  {
    id: 10,
    name: "Srirangam PHC",
    type: "Hospital",
    location: "Srirangam",
    distance: "12.8 km",
    groups: "O+, B+",
    status: "Limited",
  },
];

function HospitalsBloodBanks({ user }) {
  return (
    <div className="hospitals-page">
      {/* ================= HEADER ================= */}

      <div className="hospitals-header">
        <div className="hospitals-title-section">
          <div className="hospitals-title-icon">
            <Building2 size={32} />
          </div>

          <div>
            <div className="hospitals-eyebrow">HEALTHCARE NETWORK</div>

            <h1>Hospitals & Blood Banks</h1>

            <p>Explore and connect with hospitals and blood banks near you.</p>
          </div>
        </div>

        <div className="hospitals-header-right">
          <div className="hospitals-quote">
            “Stronger networks
            <br />
            save more lives.”
          </div>

          <button className="hospitals-add-button">
            <Plus size={17} />
            Add New Hospital / Blood Bank
          </button>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}

      <div className="hospitals-stats">
        <div className="hospital-stat-card pink">
          <div className="hospital-stat-icon red">
            <Building2 size={25} />
          </div>

          <div>
            <strong>78</strong>
            <span>Total Hospitals</span>
            <small>↑ +6 from last month</small>
          </div>
        </div>

        <div className="hospital-stat-card blue">
          <div className="hospital-stat-icon blue-icon">
            <Droplets size={25} />
          </div>

          <div>
            <strong>34</strong>
            <span>Blood Banks</span>
            <small>↑ +3 from last month</small>
          </div>
        </div>

        <div className="hospital-stat-card green">
          <div className="hospital-stat-icon green-icon">
            <MapPin size={25} />
          </div>

          <div>
            <strong>28</strong>
            <span>In Tiruchirappalli</span>
            <small>↑ +4 from last month</small>
          </div>
        </div>

        <div className="hospital-stat-card purple">
          <div className="hospital-stat-icon purple-icon">
            <Users size={25} />
          </div>

          <div>
            <strong>12</strong>
            <span>Partnered Institutions</span>
            <small>↑ +2 from last month</small>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="hospital-filter-card">
        <div className="hospital-filter-group">
          <label>Select State</label>

          <div className="hospital-select">
            <select defaultValue="Tamil Nadu">
              <option>Tamil Nadu</option>
              <option>Kerala</option>
              <option>Karnataka</option>
              <option>Andhra Pradesh</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="hospital-filter-group">
          <label>Select District</label>

          <div className="hospital-select">
            <select defaultValue="Trichy">
              <option>Trichy</option>
              <option>Madurai</option>
              <option>Chennai</option>
              <option>Coimbatore</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="hospital-filter-group">
          <label>Type</label>

          <div className="hospital-select">
            <select defaultValue="All">
              <option>All</option>
              <option>Hospital</option>
              <option>Blood Bank</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="hospital-filter-group">
          <label>Services</label>

          <div className="hospital-select">
            <select defaultValue="All">
              <option>All</option>
              <option>Emergency</option>
              <option>Blood Storage</option>
              <option>Transfusion</option>
              <option>ICU</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="hospital-filter-group">
          <label>Blood Group Availability</label>

          <div className="hospital-select">
            <select defaultValue="All">
              <option>All</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>O+</option>
              <option>O-</option>
              <option>AB+</option>
              <option>AB-</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="hospital-search">
          <Search size={16} />

          <input type="text" placeholder="Search by name or location..." />
        </div>

        <button className="hospital-search-button">
          <Search size={16} />
          Search
        </button>

        <button className="hospital-reset-button">
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="hospitals-main-grid">
        {/* TABLE */}

        <div className="hospitals-table-card">
          <div className="hospitals-card-header">
            <div className="hospitals-card-title">
              <div className="small-hospital-icon">
                <Building2 size={20} />
              </div>

              <div>
                <h2>Hospitals & Blood Banks in Trichy</h2>
                <p>Showing 1 to 10 of 28 locations</p>
              </div>
            </div>

            <button className="hospital-export-button">
              <Download size={15} />
              Export
            </button>
          </div>

          <div className="hospitals-table-wrapper">
            <table className="hospitals-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Distance</th>
                  <th>Available Groups</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {institutions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>

                    <td>
                      <strong>{item.name}</strong>
                    </td>

                    <td>{item.type}</td>

                    <td>{item.location}</td>

                    <td>{item.distance}</td>

                    <td>{item.groups}</td>

                    <td>
                      <span
                        className={`hospital-status ${
                          item.status === "Active" ? "active" : "limited"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button className="hospital-view-button">
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="hospital-pagination">
            <span>Showing 1 to 10 of 28 locations</span>

            <div>
              <button>‹</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>›</button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="hospital-right-column">
          {/* MAP PLACEHOLDER */}

          <div className="hospital-map-card">
            <div className="hospital-map-header">
              <div>
                <MapPin size={18} />
                <h2>Location Map (Trichy)</h2>
              </div>

              <button>View Full Map →</button>
            </div>

            <div className="hospital-map">
              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />

              <div className="map-label main-city">Tiruchirappalli</div>

              <div className="map-label srirangam">Srirangam</div>

              <div className="map-label thuvakudi">Thuvakudi</div>

              <div className="map-pin pin-one">
                <Building2 size={14} />
              </div>

              <div className="map-pin pin-two">
                <Building2 size={14} />
              </div>

              <div className="map-pin pin-three">
                <Droplets size={14} />
              </div>

              <div className="map-pin pin-four">
                <Building2 size={14} />
              </div>

              <div className="map-pin pin-five">
                <Building2 size={14} />
              </div>
            </div>

            <div className="map-legend">
              <span>
                <i className="legend-blue" />
                Your Location
              </span>

              <span>
                <i className="legend-red" />
                Hospital
              </span>

              <span>
                <i className="legend-blood" />
                Blood Bank
              </span>
            </div>
          </div>

          {/* SELECTED HOSPITAL */}

          <div className="selected-hospital-card">
            <div className="selected-hospital-header">
              <div>
                <Building2 size={17} />
                <h2>Trichy Government Hospital</h2>
              </div>

              <span>● Active</span>
            </div>

            <div className="selected-hospital-content">
              <div className="selected-hospital-icon">
                <Building2 size={30} />
              </div>

              <div className="selected-hospital-details">
                <p>
                  <strong>Type</strong>
                  <span>Hospital</span>
                </p>

                <p>
                  <MapPin size={13} />
                  <strong>Address</strong>
                  <span>Cantonment, Trichy, Tamil Nadu</span>
                </p>

                <p>
                  <Navigation size={13} />
                  <strong>Distance</strong>
                  <span>0.8 km</span>
                </p>

                <p>
                  <Phone size={13} />
                  <strong>Contact</strong>
                  <span>0431-2414200</span>
                </p>

                <p>
                  <Droplets size={13} />
                  <strong>Available Groups</strong>
                  <span>A+, O+, B+, AB+</span>
                </p>

                <p>
                  <ShieldCheck size={13} />
                  <strong>Services</strong>
                  <span>Emergency, Transfusion, ICU, Blood Storage</span>
                </p>
              </div>
            </div>

            <div className="selected-hospital-actions">
              <button>View Inventory</button>

              <button>
                <Navigation size={13} />
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM CARDS ================= */}

      <div className="hospital-bottom-grid">
        <div className="hospital-bottom-card trusted">
          <div className="hospital-bottom-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h3>Verified & Trusted</h3>

            <p>
              All hospitals and blood banks are verified by our team to ensure
              reliability and safety.
            </p>
          </div>
        </div>

        <div className="hospital-bottom-card suggest">
          <div className="hospital-bottom-icon">
            <Users size={24} />
          </div>

          <div>
            <h3>Suggest a Hospital/Blood Bank</h3>

            <p>
              Help us grow the network by suggesting nearby hospitals or blood
              banks.
            </p>

            <button>
              Suggest Now
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="hospital-bottom-card partner">
          <div className="hospital-bottom-icon">
            <Building2 size={24} />
          </div>

          <div>
            <h3>Partner with Us</h3>

            <p>
              Are you a hospital or blood bank? Join BloodChain AI to save more
              lives.
            </p>

            <button>
              Register Now
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalsBloodBanks;
