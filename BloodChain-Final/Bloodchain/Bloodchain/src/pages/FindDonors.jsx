import { useState } from "react";

import {
  Users,
  Droplets,
  MapPin,
  Search,
  RotateCcw,
  Phone,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send,
  Bell,
  Share2,
  FileText,
  Heart,
  ArrowRight,
} from "lucide-react";

function FindDonors() {
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [district, setDistrict] = useState("Trichy");
  const [distance, setDistance] = useState("Within 10 km");
  const [availability, setAvailability] = useState("Available Now");
  const [gender, setGender] = useState("All");
  const [search, setSearch] = useState("");

  const donors = [
    {
      id: 1,
      name: "Dinesh K",
      age: 22,
      gender: "Male",
      location: "Trichy",
      lastDonation: "12 Mar 2026",
      availability: "Available",
    },
    {
      id: 2,
      name: "Hari Prasath S",
      age: 24,
      gender: "Male",
      location: "Srirangam",
      lastDonation: "5 May 2026",
      availability: "Available",
    },
    {
      id: 3,
      name: "Arjun R",
      age: 21,
      gender: "Male",
      location: "Thuvakudi",
      lastDonation: "18 Feb 2026",
      availability: "Available",
    },
    {
      id: 4,
      name: "Karthik V",
      age: 25,
      gender: "Male",
      location: "Trichy",
      lastDonation: "20 Jun 2026",
      availability: "Available",
    },
    {
      id: 5,
      name: "Santhosh M",
      age: 23,
      gender: "Male",
      location: "Lalgudi",
      lastDonation: "10 Apr 2026",
      availability: "Available",
    },
    {
      id: 6,
      name: "Vignesh B",
      age: 26,
      gender: "Male",
      location: "Thillai Nagar",
      lastDonation: "2 Jan 2026",
      availability: "Available",
    },
    {
      id: 7,
      name: "Praveen S",
      age: 22,
      gender: "Male",
      location: "Mannachanallur",
      lastDonation: "15 May 2026",
      availability: "Available",
    },
    {
      id: 8,
      name: "Sathish R",
      age: 24,
      gender: "Male",
      location: "Trichy",
      lastDonation: "9 Mar 2026",
      availability: "Available",
    },
    {
      id: 9,
      name: "Lokesh G",
      age: 23,
      gender: "Male",
      location: "Srirangam",
      lastDonation: "28 Feb 2026",
      availability: "Available",
    },
    {
      id: 10,
      name: "Naveen K",
      age: 21,
      gender: "Male",
      location: "Thuvakudi",
      lastDonation: "11 Jun 2026",
      availability: "Available",
    },
  ];

  const filteredDonors = donors.filter((donor) => {
    const text = search.toLowerCase();

    const matchesSearch =
      donor.name.toLowerCase().includes(text) ||
      donor.location.toLowerCase().includes(text);

    const matchesGender = gender === "All" || donor.gender === gender;

    return matchesSearch && matchesGender;
  });

  const handleSearch = () => {
    console.log("Searching donors...");
  };

  const handleReset = () => {
    setBloodGroup("O+");
    setDistrict("Trichy");
    setDistance("Within 10 km");
    setAvailability("Available Now");
    setGender("All");
    setSearch("");
  };

  const handleContact = (donor) => {
    alert(`Contact request sent to ${donor.name}`);
  };

  const handleView = (donor) => {
    alert(
      `${donor.name}\nBlood Group: ${bloodGroup}\nLocation: ${donor.location}`,
    );
  };

  return (
    <div className="find-donors-page">
      {/* ================= HEADER ================= */}

      <div className="donor-page-header">
        <div className="donor-title-area">
          <div className="donor-main-icon">
            <Users size={29} />
          </div>

          <div>
            <h1>Find Donors</h1>

            <p>Search and connect with volunteer blood donors near you.</p>
          </div>
        </div>

        <div className="donor-header-right">
          <div className="donor-quote">
            <strong>“Real people. Real impact.”</strong>

            <span>Be the reason someone lives.”</span>
          </div>

          <button
            className="register-donor-button"
            onClick={() => alert("Donor registration will be connected later.")}
          >
            <Users size={16} />
            Register New Donor
          </button>
        </div>
      </div>

      {/* ================= SUMMARY ================= */}

      <div className="donor-summary-grid">
        <div className="donor-summary-card donor-red-card">
          <div className="donor-summary-icon red">
            <Users size={25} />
          </div>

          <div>
            <strong>2,458</strong>
            <span>Registered Donors</span>
            <small>in Trichy</small>
          </div>
        </div>

        <div className="donor-summary-card donor-blue-card">
          <div className="donor-summary-icon blue">
            <Droplets size={25} />
          </div>

          <div>
            <strong>486</strong>
            <span>O+ Donors</span>
            <small>Available</small>
          </div>
        </div>

        <div className="donor-summary-card donor-green-card">
          <div className="donor-summary-icon green">
            <MapPin size={25} />
          </div>

          <div>
            <strong>320</strong>
            <span>Nearby Donors</span>
            <small>Within 10 km</small>
          </div>
        </div>

        <div className="donor-summary-card donor-purple-card">
          <div className="donor-summary-icon purple">
            <Users size={25} />
          </div>

          <div>
            <strong>156</strong>
            <span>Active Donors</span>
            <small>This Month</small>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="donor-filter-card">
        <div className="donor-filter-field">
          <label>Blood Group</label>

          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          >
            <option>O+</option>
            <option>O-</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
        </div>

        <div className="donor-filter-field">
          <label>Select District</label>

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option>Trichy</option>
            <option>Madurai</option>
            <option>Chennai</option>
            <option>Coimbatore</option>
            <option>Salem</option>
          </select>
        </div>

        <div className="donor-filter-field">
          <label>Distance</label>

          <select
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          >
            <option>Within 5 km</option>
            <option>Within 10 km</option>
            <option>Within 25 km</option>
            <option>Within 50 km</option>
          </select>
        </div>

        <div className="donor-filter-field">
          <label>Availability</label>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option>Available Now</option>
            <option>Available Today</option>
            <option>All</option>
          </select>
        </div>

        <div className="donor-filter-field">
          <label>Gender</label>

          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option>All</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        <button className="donor-search-button" onClick={handleSearch}>
          <Search size={16} />
          Search
        </button>

        <button className="donor-reset-button" onClick={handleReset}>
          <RotateCcw size={15} />
          Reset Filters
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="donor-main-grid">
        {/* DONOR TABLE */}

        <section className="donor-table-card">
          <div className="donor-table-header">
            <div className="donor-table-title">
              <Users size={23} />

              <h2>
                Available Donors ({bloodGroup}) - Near {district}
              </h2>
            </div>

            <span>Showing 1 to 10 of 320 donors</span>
          </div>

          <div className="donor-table-wrapper">
            <table className="donor-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Location</th>
                  <th>Last Donation</th>
                  <th>Availability</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredDonors.map((donor) => (
                  <tr key={donor.id}>
                    <td>{donor.id}</td>

                    <td>
                      <strong>{donor.name}</strong>
                    </td>

                    <td>{donor.age}</td>

                    <td>{donor.gender}</td>

                    <td>{donor.location}</td>

                    <td>{donor.lastDonation}</td>

                    <td>
                      <span className="donor-available-badge">Available</span>
                    </td>

                    <td>
                      <button
                        className="donor-contact-button"
                        onClick={() => handleContact(donor)}
                      >
                        <Phone size={12} />
                        Contact
                      </button>
                    </td>

                    <td>
                      <button
                        className="donor-view-button"
                        onClick={() => handleView(donor)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="donor-pagination">
            <button>
              <ChevronLeft size={14} />
            </button>

            <button className="active">1</button>

            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>

            <button>
              <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* ================= RIGHT SIDE ================= */}

        <aside className="donor-right-sidebar">
          {/* MAP */}

          <section className="donor-map-card">
            <div className="donor-side-title">
              <div>
                <MapPin size={20} />
              </div>

              <h2>Donors Near You (Map View)</h2>

              <button>View Full Map →</button>
            </div>

            <div className="fake-donor-map">
              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />

              <span className="fake-donor-marker m1">📍</span>

              <span className="fake-donor-marker m2">📍</span>

              <span className="fake-donor-marker m3">📍</span>

              <span className="fake-donor-marker m4">📍</span>

              <span className="fake-donor-marker m5">📍</span>

              <span className="fake-location-marker">➤</span>

              <div className="fake-map-city">Tiruchirappalli</div>

              <div className="fake-map-area area-one">Srirangam</div>

              <div className="fake-map-area area-two">Thuvakudi</div>

              <div className="fake-map-area area-three">Lalgudi</div>
            </div>

            <div className="map-legend">
              <span>
                <i className="blue-dot" />
                Your Location
              </span>

              <span>
                <i className="red-dot" />
                Available Donor
              </span>
            </div>
          </section>

          {/* QUICK ACTIONS */}

          <section className="quick-actions-card">
            <div className="quick-actions-title">
              <Heart size={20} />
              <h2>Quick Actions</h2>
            </div>

            <div className="quick-action-grid">
              <button onClick={() => alert("Blood request page will open.")}>
                <Send size={16} />
                Send Blood Request
              </button>

              <button onClick={() => alert("Nearby donors will be notified.")}>
                <Bell size={16} />
                Notify Nearby Donors
              </button>

              <button onClick={() => alert("Request link copied.")}>
                <Share2 size={16} />
                Share Request Link
              </button>

              <button onClick={() => alert("Donor guidelines will open.")}>
                <FileText size={16} />
                View Donor Guidelines
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* ================= BOTTOM CARDS ================= */}

      <div className="donor-bottom-grid">
        <div className="need-donor-card">
          <div className="bottom-donor-icon red">
            <Users size={25} />
          </div>

          <div>
            <h2>Need More Donors?</h2>

            <p>
              If you couldn't find enough donors, try expanding the search
              radius or notify registered donors in nearby districts.
            </p>
          </div>

          <button>
            Expand Search
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="become-donor-card">
          <div className="bottom-donor-icon blue">
            <Heart size={25} />
          </div>

          <div>
            <h2>Become a Donor</h2>

            <p>Not a donor yet? Register now and help save lives.</p>
          </div>

          <button>
            Register Now
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FindDonors;
