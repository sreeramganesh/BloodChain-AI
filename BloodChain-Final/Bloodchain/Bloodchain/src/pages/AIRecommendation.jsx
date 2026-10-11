import {
  Brain,
  Droplets,
  Users,
  MapPin,
  Zap,
  BarChart3,
  Clock,
  ShieldCheck,
  Send,
  ArrowRight,
  Pencil,
  Headphones,
  Info,
  List,
} from "lucide-react";

function AIRecommendation() {
  const sources = [
    {
      rank: 1,
      name: "Trichy Government Hospital",
      distance: "2.3 km",
      units: "120 units",
      score: "94%",
      tag: "Best Match",
    },
    {
      rank: 2,
      name: "SRM Hospital",
      distance: "5.8 km",
      units: "45 units",
      score: "89%",
      tag: "Closest",
    },
    {
      rank: 3,
      name: "Kauvery Hospital",
      distance: "8.1 km",
      units: "28 units",
      score: "84%",
      tag: "High Availability",
    },
    {
      rank: 4,
      name: "Apollo Hospital",
      distance: "10.4 km",
      units: "60 units",
      score: "79%",
      tag: "Quick Response",
    },
    {
      rank: 5,
      name: "MGM Hospital",
      distance: "12.2 km",
      units: "35 units",
      score: "76%",
      tag: "Trusted Partner",
    },
  ];

  return (
    <div className="ai-recommendation-page">
      {/* HEADER */}

      <div className="ai-page-header">
        <div className="ai-page-title">
          <div className="ai-page-icon">
            <Brain size={29} />
          </div>

          <div>
            <h1>AI Recommendation</h1>

            <p>
              Smart blood source recommendations for faster, safer, and more
              reliable supply.
            </p>
          </div>
        </div>

        <div className="ai-header-right">
          <div className="ai-quote">
            <strong>“Data finds the source,</strong>
            <span>AI brings it closer.”</span>
          </div>

          <div className="ai-engine-active">
            <span className="active-dot" />

            <div>
              <strong>AI Engine Active</strong>
              <small>Analyzing real-time data...</small>
            </div>
          </div>
        </div>
      </div>

      {/* REQUEST BEING ANALYSED */}

      <div className="ai-request-card">
        <div className="ai-request-icon">
          <Droplets size={36} />
          <span>1</span>
        </div>

        <div className="ai-request-info">
          <small>Blood Request Being Analysed</small>
        </div>

        <div className="ai-request-item">
          <span>Blood Group</span>
          <strong>O+</strong>
        </div>

        <div className="ai-request-item">
          <span>Units Required</span>
          <strong>20</strong>
        </div>

        <div className="ai-request-item">
          <span>Location</span>
          <strong>Trichy, Tamil Nadu</strong>
        </div>

        <div className="ai-request-item">
          <span>Urgency</span>
          <b className="critical-badge">Critical</b>
        </div>

        <div className="ai-request-item requested-by">
          <span>Requested By</span>
          <strong>Trichy Government Hospital</strong>
        </div>

        <button className="edit-request-btn">
          <Pencil size={14} />
          Edit Request
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="ai-summary-grid">
        <div className="ai-summary-card red">
          <div className="ai-summary-icon">
            <Users size={25} />
          </div>

          <div>
            <strong>12</strong>
            <span>Matching Sources</span>
            <small>↑ +4 from last search</small>
          </div>
        </div>

        <div className="ai-summary-card blue">
          <div className="ai-summary-icon">
            <MapPin size={25} />
          </div>

          <div>
            <strong>5</strong>
            <span>Nearby Sources</span>
            <small>Within 10 km</small>
          </div>
        </div>

        <div className="ai-summary-card yellow">
          <div className="ai-summary-icon">
            <Zap size={25} />
          </div>

          <div>
            <strong>3</strong>
            <span>Urgent Matches</span>
            <small>Available now</small>
          </div>
        </div>

        <div className="ai-summary-card green">
          <div className="ai-summary-icon">
            <BarChart3 size={25} />
          </div>

          <div>
            <strong>94%</strong>
            <span>AI Confidence</span>
            <small>High accuracy</small>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}

      <div className="ai-main-grid">
        {/* TOP RECOMMENDATION */}

        <section className="top-ai-card">
          <div className="ai-card-heading">
            <div>
              <Users size={21} />
              <h2>Top AI Recommendation</h2>
            </div>

            <span className="best-match">Best Match</span>
          </div>

          <div className="recommendation-content">
            <div className="recommendation-details">
              <h3>Trichy Government Hospital</h3>

              <div className="hospital-rating">
                <span>★</span>
                <strong>4.8</strong>
                <i>|</i>
                <span className="hospital-type">Government Hospital</span>
              </div>

              <div className="recommendation-info">
                <div>
                  <MapPin size={15} />
                  <span>Distance</span>
                  <b>2.3 km</b>
                </div>

                <div>
                  <Droplets size={15} />
                  <span>Available O+</span>
                  <b>120 units</b>
                </div>

                <div>
                  <Users size={15} />
                  <span>Requested Units</span>
                  <b>20 units</b>
                </div>

                <div>
                  <Clock size={15} />
                  <span>Travel Time</span>
                  <b>8 minutes</b>
                </div>

                <div>
                  <ShieldCheck size={15} />
                  <span>Reliability</span>
                  <b>96%</b>
                </div>
              </div>
            </div>

            <div className="ai-score">
              <div className="score-circle">
                <strong>94%</strong>
              </div>

              <span>AI Match Score</span>
            </div>
          </div>

          <div className="recommendation-buttons">
            <button className="request-transfer-btn">
              <Send size={16} />
              Request Transfer
            </button>

            <button className="view-details-btn">
              View Details
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* SOURCES / MAP */}

        <section className="nearby-sources-card">
          <div className="sources-heading">
            <div>
              <MapPin size={20} />
              <h2>Nearby Blood Sources</h2>
            </div>

            <button>View Larger Map →</button>
          </div>

          <div className="sources-content">
            {/* FAKE MAP */}

            <div className="ai-fake-map">
              <div className="map-water" />

              <span className="ai-map-marker marker-1">+</span>

              <span className="ai-map-marker marker-2">+</span>

              <span className="ai-map-marker marker-3">+</span>

              <span className="ai-map-marker marker-4">+</span>

              <span className="ai-current-location">➤</span>

              <strong className="map-city-name">Tiruchirappalli</strong>

              <span className="map-place p1">Srirangam</span>

              <span className="map-place p2">Thuvakudi</span>

              <span className="map-place p3">Samayapuram</span>

              <span className="map-place p4">Lalgudi</span>
            </div>

            {/* SOURCE LIST */}

            <div className="source-list">
              <h3>Recommended Blood Sources</h3>

              {sources.map((source) => (
                <div className="source-item" key={source.rank}>
                  <div className="source-rank">{source.rank}</div>

                  <div className="source-details">
                    <strong>{source.name}</strong>

                    <span>
                      {source.distance} | {source.units}
                    </span>
                  </div>

                  <div className="source-score">
                    <span>{source.score}</span>

                    <small>{source.tag}</small>
                  </div>

                  <button className="source-view">View</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* LOWER GRID */}

      <div className="ai-lower-grid">
        {/* WHY THIS SOURCE */}

        <section className="why-source-card">
          <div className="lower-card-title">
            <MapPin size={19} />

            <h2>Why This Source?</h2>

            <Info size={15} />
          </div>

          <div className="score-bars">
            <div>
              <span>Blood Availability</span>
              <div className="bar">
                <i style={{ width: "98%" }} />
              </div>
              <b>98%</b>
            </div>

            <div>
              <span>Distance Proximity</span>
              <div className="bar">
                <i style={{ width: "92%" }} />
              </div>
              <b>92%</b>
            </div>

            <div>
              <span>Urgency Response</span>
              <div className="bar">
                <i style={{ width: "96%" }} />
              </div>
              <b>96%</b>
            </div>

            <div>
              <span>Historical Reliability</span>
              <div className="bar">
                <i style={{ width: "90%" }} />
              </div>
              <b>90%</b>
            </div>

            <div>
              <span>Demand Forecast</span>
              <div className="bar">
                <i style={{ width: "85%" }} />
              </div>
              <b>85%</b>
            </div>
          </div>
        </section>

        {/* AI INSIGHT */}

        <section className="ai-insight-card">
          <div className="insight-icon">
            <Brain size={24} />
          </div>

          <div>
            <strong>AI Insight</strong>

            <p>
              Trichy Government Hospital is the best match because it has
              sufficient O+ stock, is closest to your location, has a high
              response rate, and can fulfill the request within the required
              time.
            </p>
          </div>
        </section>

        {/* HUMAN ASSISTANT */}

        <section className="human-assistant-card">
          <div className="assistant-header">
            <div>
              <Headphones size={22} />
              <h2>Human Assistant</h2>
            </div>

            <span>
              <i />
              Live Support
            </span>
          </div>

          <div className="assistant-body">
            <div className="assistant-avatar">👩🏻‍💼</div>

            <div>
              <h3>Need assistance?</h3>

              <p>
                Our support team is here to help you with blood requests,
                transfers, or any queries.
              </p>

              <div className="assistant-buttons">
                <button>💬 Chat Now</button>

                <button>📞 Call Support</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* OTHER SOURCES */}

      <div className="other-sources-card">
        <div>
          <List size={21} />
        </div>

        <section>
          <strong>Other Potential Sources</strong>
          <span>
            7 more blood banks and hospitals can also fulfill this request.
          </span>
        </section>

        <button>
          View All Sources
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default AIRecommendation;
