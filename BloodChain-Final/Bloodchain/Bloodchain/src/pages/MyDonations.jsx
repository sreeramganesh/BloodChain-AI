import {
  Heart,
  CalendarDays,
  Users,
  ShieldCheck,
  FileText,
  ArrowRight,
  Trophy,
  Share2,
  Download,
  Droplets,
} from "lucide-react";

function MyDonations({ user }) {
  const donations = [
    {
      date: "12 Mar 2026",
      bloodGroup: "O+",
      hospital: "Trichy Government Hospital",
      location: "Trichy",
      units: "1 Unit",
      status: "Completed",
    },
    {
      date: "18 Nov 2025",
      bloodGroup: "O+",
      hospital: "SRM Hospital",
      location: "Kattankulathur",
      units: "1 Unit",
      status: "Completed",
    },
    {
      date: "22 Aug 2024",
      bloodGroup: "O+",
      hospital: "Apollo Hospital",
      location: "Trichy",
      units: "1 Unit",
      status: "Completed",
    },
    {
      date: "10 Jan 2024",
      bloodGroup: "O+",
      hospital: "Cauvery Hospital",
      location: "Trichy",
      units: "1 Unit",
      status: "Completed",
    },
  ];

  return (
    <div className="donations-page">
      {/* HEADER */}

      <div className="donations-header">
        <div className="donations-title-area">
          <div className="donations-title-icon">
            <Heart size={30} fill="currentColor" />
          </div>

          <div>
            <div className="donations-eyebrow">BLOOD DONATION</div>

            <h1>My Donations</h1>

            <p>Track your blood donation history and make a bigger impact.</p>
          </div>
        </div>

        <div className="donations-header-quote">
          <em>
            "A single donation
            <br />
            can save up to three lives."
          </em>

          <button>
            <span>+</span>
            Schedule New Donation
          </button>
        </div>
      </div>

      {/* STATS */}

      <div className="donation-stats">
        <div className="donation-stat-card red">
          <div className="donation-stat-icon">
            <Droplets size={30} />
          </div>

          <div>
            <span>Total Donations</span>
            <strong>4</strong>
            <small>Thank you for your support!</small>
          </div>
        </div>

        <div className="donation-stat-card blue">
          <div className="donation-stat-icon">
            <CalendarDays size={30} />
          </div>

          <div>
            <span>Last Donation</span>
            <strong>12 Mar 2026</strong>
            <small>Trichy Government Hospital</small>
          </div>
        </div>

        <div className="donation-stat-card pink">
          <div className="donation-stat-icon">
            <Users size={30} />
          </div>

          <div>
            <span>Lives Potentially Saved</span>
            <strong>12</strong>
            <small>Each donation can save up to 3 lives</small>
          </div>
        </div>

        <div className="donation-stat-card green">
          <div className="donation-stat-icon">
            <ShieldCheck size={30} />
          </div>

          <div>
            <span>Eligibility Status</span>
            <strong>Eligible to Donate</strong>
            <small>You can donate again after 15 Jun 2026</small>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}

      <div className="donations-main-grid">
        {/* DONATION HISTORY */}

        <div className="donation-history-card">
          <div className="donation-card-header">
            <div className="donation-section-title">
              <Users size={22} />
              <div>
                <h2>Donation History</h2>
                <p>Your previous blood donations</p>
              </div>
            </div>
          </div>

          <div className="donation-table-wrapper">
            <table className="donation-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Donation Date</th>
                  <th>Blood Group</th>
                  <th>Hospital / Blood Bank</th>
                  <th>Location</th>
                  <th>Units</th>
                  <th>Certificate</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {donations.map((donation, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>

                    <td>{donation.date}</td>

                    <td>
                      <span className="donation-blood-group">
                        {donation.bloodGroup}
                      </span>
                    </td>

                    <td>
                      <strong>{donation.hospital}</strong>
                    </td>

                    <td>{donation.location}</td>

                    <td>{donation.units}</td>

                    <td>
                      <button className="certificate-button">
                        <FileText size={14} />
                        View
                      </button>
                    </td>

                    <td>
                      <span className="donation-status">{donation.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="donations-side">
          {/* NEXT ELIGIBLE */}

          <div className="eligible-card">
            <div className="side-card-title">
              <CalendarDays size={23} />
              <h2>Next Eligible Date</h2>
            </div>

            <strong className="eligible-date">15 Jun 2026</strong>

            <p>You can donate again after 3 months from your last donation.</p>
          </div>

          {/* DONATE AGAIN */}

          <div className="donate-again-card">
            <div className="donate-again-icon">
              <Droplets size={28} />
            </div>

            <h2>Want to Donate Again?</h2>

            <p>Your next donation can make a huge difference.</p>

            <button>
              <CalendarDays size={16} />
              Schedule Donation
            </button>
          </div>

          {/* SHARE */}

          <div className="share-goodness-card">
            <div className="share-icon">
              <Share2 size={26} />
            </div>

            <h2>Share the Goodness</h2>

            <p>Inspire others to donate and be a hero too!</p>

            <button>
              <CalendarDays size={16} />
              Share My Journey
            </button>
          </div>

          {/* CERTIFICATE */}

          <div className="certificate-card">
            <div className="certificate-icon">
              <Download size={25} />
            </div>

            <h2>Download Certificate</h2>

            <p>Get your official donation certificates for your records.</p>

            <button>
              <Download size={16} />
              View All Certificates
            </button>
          </div>
        </div>
      </div>

      {/* LIFE SAVER BANNER */}

      <div className="life-saver-banner">
        <div className="life-saver-icon">
          <Trophy size={32} />
        </div>

        <div>
          <h2>You're a Life Saver!</h2>

          <p>
            Your consistent donations help ensure that hospitals always have
            blood when it's needed most. Thank you for being a part of
            BloodChain AI.
          </p>
        </div>

        <div className="thank-you">
          <strong>Thank You ♡</strong>
          <span>Donors like you make the world healthier!</span>
        </div>
      </div>

      {/* DONATION IMPACT */}

      <div className="donation-impact-card">
        <div className="impact-header">
          <div className="impact-icon">
            <ArrowRight size={20} />
          </div>

          <h2>Donation Impact</h2>
        </div>

        <div className="impact-grid">
          <div className="impact-item">
            <Droplets size={25} />
            <div>
              <strong>4</strong>
              <span>Donations Made</span>
            </div>
          </div>

          <div className="impact-item">
            <Users size={25} />
            <div>
              <strong>12</strong>
              <span>Lives Potentially Saved</span>
            </div>
          </div>

          <div className="impact-item green-impact">
            <Users size={25} />
            <div>
              <strong>400+</strong>
              <span>People Reached through your support</span>
            </div>
          </div>

          <div className="impact-message">
            <Heart size={28} fill="currentColor" />
            <strong>
              A Healthier
              <br />
              Tomorrow
              <br />
              Because of You
            </strong>
          </div>
        </div>

        <div className="donation-quote">
          "Not all heroes wear capes. Some donate blood."
        </div>
      </div>
    </div>
  );
}

export default MyDonations;
