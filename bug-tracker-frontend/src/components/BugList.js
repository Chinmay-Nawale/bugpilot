import "./BugList.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaCheck, FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BugList() {

  const [bugs, setBugs] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    severity: "",
    reported_by: "",
    assigned_to: "",
    expected_end_date: ""
  });

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/bugs")
      .then(response => {
        setBugs(response.data);
      })
      .catch(error => {
        console.error("Error fetching bugs:", error);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createBug = () => {
    axios.post("http://127.0.0.1:5000/bugs", formData)
      .then(response => {

        toast.success("Bug created successfully");

        setBugs([...bugs, response.data]);

        setFormData({
          title: "",
          description: "",
          priority: "",
          severity: "",
          reported_by: "",
          assigned_to: "",
          expected_end_date: ""
        });

      })
      .catch(error => {
        console.error("Error creating bug:", error);
      });
  };

  const deleteBug = (bug_id) => {

    if (!window.confirm("Are you sure you want to delete this bug?")) return;

    axios.delete(`http://127.0.0.1:5000/bugs/${bug_id}`)
      .then(() => {

        toast.success("Bug deleted successfully");

        setBugs(bugs.filter(bug => bug.bug_id !== bug_id));

      })
      .catch(error => {
        console.error("Error deleting bug:", error);
      });
  };

  const updateBug = (bug_id, newStatus) => {

    axios.put(`http://127.0.0.1:5000/bugs/${bug_id}`, { status: newStatus })
      .then(() => {

        toast.success(`Bug moved to ${newStatus}`);

        setBugs(
          bugs.map(bug =>
            bug.bug_id === bug_id
              ? { ...bug, status: newStatus }
              : bug
          )
        );

      })
      .catch(error => {
        console.error("Error updating bug:", error);
      });
  };

  const [selectedBug, setSelectedBug] = useState(null);

  return (

    <div className="container">

      <ToastContainer />

      {/* Dashboard Section */}
      <div className="section">

        <h2>BugPilot Dashboard</h2>

        <div className="stats">

          <div className="card open">
            Open Bugs: {bugs.filter(bug => bug.status === "Open").length}
          </div>

          <div className="card closed">
            Closed Bugs: {bugs.filter(bug => bug.status === "Closed").length}
          </div>

          <div className="card total">
            Total Bugs: {bugs.length}
          </div>

        </div>

      </div>

      {/* Create Bug Section */}
      <div className="section">

        <h2>Create Bug</h2>

        <div className="form-container">

          <input
            type="text"
            name="title"
            placeholder="Enter bug Title"
            value={formData.title}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Enter Bug description"
            value={formData.description}
            onChange={handleChange}
          />

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
          >
            <option value="">Select Severity</option>
            <option value="Minor">Minor</option>
            <option value="Major">Major</option>
            <option value="Critical">Critical</option>
          </select>

          <input
            type="number"
            name="reported_by"
            placeholder="Reported By (User ID)"
            value={formData.reported_by}
            onChange={handleChange}
          />

          <input
            type="number"
            name="assigned_to"
            placeholder="Assigned To (User ID)"
            value={formData.assigned_to}
            onChange={handleChange}
          />

          <input
            type="text"
            name="expected_end_date"
            placeholder="Expected End Date"
            onFocus={(e) => e.target.type = "date"}
            onBlur={(e) => { if (!e.target.value) e.target.type = "text" }}
            value={formData.expected_end_date}
            onChange={handleChange}
          />

          <button type="button" onClick={createBug}>
            Add Bug
          </button>

        </div>

      </div>

      {/* Bug List Section */}
      <div className="section">

        <h2>Bug List</h2>

        <div className="controls">

          <div className="search-wrapper">

            <FaSearch className="search-icon" />

            <input
              className="search-box"
              type="text"
              placeholder="Search Bug"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>

          <div className="filter-container">

            <label>Sort by:</label>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">None</option>
              <option value="priority">Priority</option>
              <option value="date">Created Date</option>
            </select>

            <label>Filter by Status:</label>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>

          </div>

        </div>

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Reported By</th>
              <th>Assigned To</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {bugs
              .filter(bug =>
                filterStatus === "All" || bug.status === filterStatus
              )
              .filter(bug =>
                (bug.title || "").toLowerCase().includes(searchTerm.toLowerCase())
              )
              .sort((a, b) => {

                if (sortOption === "priority") {

                  const priorityOrder = { High: 1, Medium: 2, Low: 3 };

                  return (
                    (priorityOrder[a.priority] || 99) -
                    (priorityOrder[b.priority] || 99)
                  );
                }

                if (sortOption === "date") {
                  return new Date(a.created_date || 0) -
                         new Date(b.created_date || 0);
                }

                return 0;
              })
              .map((bug) => (

                <tr key={bug.bug_id}>

                  <td
                    className="bug-id"
                    onClick={()=> setSelectedBug(bug)}
                  >
                    {bug.bug_id}

                  </td>

                  <td>{bug.title}</td>

                  <td>
                    <span className={`priority ${(bug.priority || "").toLowerCase()}`}>
                      {bug.priority}
                    </span>
                  </td>

                  <td>
                    <span className={`status ${(bug.status || "").toLowerCase()}`}>
                      {bug.status}
                    </span>
                  </td>

                  <td>{bug.reported_by}</td>

                  <td>{bug.assigned_to}</td>

                  <td>
                    {bug.created_date
                      ? new Date(bug.created_date).toLocaleDateString()
                      : "-"
                    }
                  </td>

                  <td>

                    <button onClick={() => deleteBug(bug.bug_id)}>
                      <FaTrash style={{ marginRight: "5px" }} />
                      Delete
                    </button>

                    <button
                      onClick={() => updateBug(bug.bug_id, "In Progress")}
                      disabled={bug.status !== "Open"}
                    >
                      Start Work
                    </button>

                    <button
                      onClick={() => updateBug(bug.bug_id, "Closed")}
                      disabled={bug.status === "Closed"}
                    >
                      <FaCheck style={{ marginRight: "5px" }} />
                      Resolve
                    </button>

                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    {
      selectedBug && (
        <div className="modal-overlay">
          <div className="modal">
          <h2>Bug Details</h2>
          <p><b>ID:</b>{selectedBug.bug_id}</p>
          <p><b>Title:</b>{selectedBug.title}</p>
          <p><b>Description:</b>{selectedBug.description || "No description"}</p>
          <p><b>Priority:</b>{selectedBug.priority}</p>
          <p><b>Status:</b>{selectedBug.status}</p>
          <p><b>Reported By:</b>{selectedBug.reported_by}</p>
          <p><b>Assigned To:</b>{selectedBug.assigned_to}</p>
          <p><b>Created Date:</b>{selectedBug.created_date}</p>
          <button onClick={()=> setSelectedBug(null)}>Close</button>
          </div>
          </div>
      )
    }
    </div>
  );
}

export default BugList;