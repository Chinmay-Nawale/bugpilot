import "./BugList.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaCheck, FaSearch } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BugList() {

  const [bugs, setBugs] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);

  const [formData, setFormData] = useState({
    title:"",
    description:"",
    priority:"",
    severity:"",
    reported_by:"",
    assigned_to:"",
    expected_end_date:""
  });

  const [filterStatus,setFilterStatus] = useState("All");
  const [searchTerm,setSearchTerm] = useState("");
  const [sortOption,setSortOption] = useState("");

  useEffect(()=>{
    axios.get("http://127.0.0.1:5000/bugs")
      .then(res=>setBugs(res.data))
      .catch(err=>console.error(err));
  },[]);

  const handleChange = (e)=>{
    setFormData({
      ...formData,
      [e.target.name]:e.target.value
    });
  };

  const createBug = ()=>{
    axios.post("http://127.0.0.1:5000/bugs",formData)
      .then(res=>{
        toast.success("Bug created successfully");
        setBugs([...bugs,res.data]);
        setFormData({
          title:"",
          description:"",
          priority:"",
          severity:"",
          reported_by:"",
          assigned_to:"",
          expected_end_date:""
        });
      })
      .catch(err=>console.error(err));
  };

  const deleteBug = (id)=>{
    if(!window.confirm("Delete this bug?")) return;

    axios.delete(`http://127.0.0.1:5000/bugs/${id}`)
      .then(()=>{
        toast.success("Bug deleted");
        setBugs(bugs.filter(b=>b.bug_id!==id));
      })
      .catch(err=>console.error(err));
  };

  const updateBug = (id,status)=>{
    axios.put(`http://127.0.0.1:5000/bugs/${id}`,{status})
      .then(()=>{
        toast.success(`Bug moved to ${status}`);
        setBugs(
          bugs.map(b =>
            b.bug_id===id ? {...b,status} : b
          )
        );
      })
      .catch(err=>console.error(err));
  };

  const sortedFilteredBugs = bugs
  .filter(b => filterStatus==="All" || b.status===filterStatus)
  .filter(b => (b.title||"").toLowerCase().includes(searchTerm.toLowerCase()))
  .sort((a,b)=>{
      if(sortOption==="priority"){
        const order={High:1,Medium:2,Low:3};
        return (order[a.priority]||99)-(order[b.priority]||99);
      }
      if(sortOption==="date"){
        return new Date(a.created_date)-new Date(b.created_date);
      }
      return 0;
  });

  return(
  <div className="container">

  <ToastContainer/>

  {/* Dashboard */}
  <div className="section">

    <h2>BugPilot Dashboard</h2>

    <div className="stats">

      <div className="card open">
        Open Bugs: {bugs.filter(b=>b.status==="Open").length}
      </div>

      <div className="card closed">
        Closed Bugs: {bugs.filter(b=>b.status==="Closed").length}
      </div>

      <div className="card total">
        Total Bugs: {bugs.length}
      </div>

    </div>

  </div>

  {/* Create Bug */}
  <div className="section">

    <h2>Create Bug</h2>

    <div className="form-container">

      <input
      name="title"
      placeholder="Bug Title"
      value={formData.title}
      onChange={handleChange}
      />

      <textarea
      name="description"
      placeholder="Bug Description"
      value={formData.description}
      onChange={handleChange}
      />

      <select name="priority" value={formData.priority} onChange={handleChange}>
        <option value="">Priority</option>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <select name="severity" value={formData.severity} onChange={handleChange}>
        <option value="">Severity</option>
        <option>Minor</option>
        <option>Major</option>
        <option>Critical</option>
      </select>

      <input
      type="number"
      name="reported_by"
      placeholder="Reported By"
      value={formData.reported_by}
      onChange={handleChange}
      />

      <input
      type="number"
      name="assigned_to"
      placeholder="Assigned To"
      value={formData.assigned_to}
      onChange={handleChange}
      />

      <input
      type="text"
      name="expected_end_date"
      placeholder="Expected End Date"
      onFocus={(e)=>e.target.type="date"}
      onBlur={(e)=>{if(!e.target.value)e.target.type="text"}}
      value={formData.expected_end_date}
      onChange={handleChange}
      />

      <button onClick={createBug}>Add Bug</button>

    </div>

  </div>

  {/* Bug List */}
  <div className="section">

  <h2>Bug List</h2>

  <div className="controls">

    <div className="search-wrapper">
      <FaSearch className="search-icon"/>
      <input
      className="search-box"
      placeholder="Search bug"
      value={searchTerm}
      onChange={e=>setSearchTerm(e.target.value)}
      />
    </div>

    <div className="filter-container">

      <label>Sort:</label>

      <select value={sortOption} onChange={e=>setSortOption(e.target.value)}>
        <option value="">None</option>
        <option value="priority">Priority</option>
        <option value="date">Created Date</option>
      </select>

      <label>Status:</label>

      <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
        <option>All</option>
        <option>Open</option>
        <option>In Progress</option>
        <option>Closed</option>
      </select>

    </div>

  </div>

  <table>

  <thead>
  <tr>
    <th>ID</th>
    <th>Title</th>
    <th>Priority</th>
    <th>Severity</th>
    <th>Status</th>
    <th>Reported</th>
    <th>Assigned</th>
    <th>Created</th>
    <th>Expected End</th>
    <th>Action</th>
  </tr>
  </thead>

  <tbody>

  {sortedFilteredBugs.map(bug=>{

  const overdue =
    bug.expected_end_date &&
    new Date(bug.expected_end_date)<new Date() &&
    bug.status!=="Closed";

  return(

  <tr key={bug.bug_id} className={overdue?"overdue":""}>

  <td className="bug-id" onClick={()=>setSelectedBug(bug)}>
    {bug.bug_id}
  </td>

  <td>{bug.title}</td>

  <td>
    <span className={`priority ${bug.priority?.toLowerCase()}`}>
      {bug.priority}
    </span>
  </td>

  <td>
    <span className={`severity ${bug.severity?.toLowerCase()}`}>
      {bug.severity}
    </span>
  </td>

  <td>
    <span className={`status ${bug.status?.toLowerCase().replace(" ","-")}`}>
      {bug.status}
    </span>
  </td>

  <td>{bug.reported_by}</td>
  <td>{bug.assigned_to}</td>

  <td>
    {bug.created_date ?
    new Date(bug.created_date).toLocaleDateString() : "-"}
  </td>

  <td>
    {bug.expected_end_date ?
    new Date(bug.expected_end_date).toLocaleDateString() : "-"}
  </td>

  <td>

    <button onClick={()=>deleteBug(bug.bug_id)}>
      <FaTrash/> Delete
    </button>

    <button
    onClick={()=>updateBug(bug.bug_id,"In Progress")}
    disabled={bug.status!=="Open"}>
      Start
    </button>

    <button
    onClick={()=>updateBug(bug.bug_id,"Closed")}
    disabled={bug.status==="Closed"}>
      <FaCheck/> Resolve
    </button>

  </td>

  </tr>

  );

  })}

  </tbody>
  </table>

  </div>

  {selectedBug &&(

  <div className="modal-overlay">

  <div className="modal">

  <h2>Bug Details</h2>

  <p><b>ID:</b> {selectedBug.bug_id}</p>
  <p><b>Title:</b> {selectedBug.title}</p>
  <p><b>Description:</b> {selectedBug.description||"No description"}</p>
  <p><b>Priority:</b> {selectedBug.priority}</p>
  <p><b>Severity:</b> {selectedBug.severity}</p>
  <p><b>Status:</b> {selectedBug.status}</p>
  <p><b>Reported:</b> {selectedBug.reported_by}</p>
  <p><b>Assigned:</b> {selectedBug.assigned_to}</p>
  <p><b>Created:</b> {selectedBug.created_date}</p>
  <p><b>Expected End:</b> {selectedBug.expected_end_date}</p>

  <button onClick={()=>setSelectedBug(null)}>Close</button>

  </div>

  </div>

  )}

  </div>
  );
}

export default BugList;