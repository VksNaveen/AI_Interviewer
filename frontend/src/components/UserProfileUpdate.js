import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../Profile.css';

const UserProfileUpdate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    experience: "",
    company_experience: [{ company: "", years: "" }],
    skills: [],
    preferred_role: "",
    interest_area: "",
    education: "",
    education_year: "",
    certifications: [],
    projects: "",
    linkedin: "",
    github: "",
    expected_salary: "",
    location_preference: "",
    resume: null,
  });

  const skillsOptions = ["Python", "Java", "React", "Machine Learning", "C++", "JavaScript", "SQL", "Others"];
  const roleOptions = ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer", "Others"];
  const interestAreas = ["AI/ML", "Web Development", "Data Analysis", "Cybersecurity", "Others"];
  const degreeOptions = ["Bachelor's", "Master's"];
  const locationOptions = ["Remote", "Onsite"];

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:8000/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({
          ...data,
          company_experience: data.company_experience || [{ company: "", years: "" }],
          skills: data.skills || [],
          certifications: data.certifications || [],
          resume: null,
        });
      } else {
        console.error("Error fetching profile:", data.message);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, [e.target.name]: selectedOptions }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, resume: e.target.files[0] }));
  };

  const handleCompanyExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCompanyExperience = formData.company_experience.map((exp, i) =>
      i === index ? { ...exp, [name]: value } : exp
    );
    setFormData((prev) => ({ ...prev, company_experience: updatedCompanyExperience }));
  };

  const addCompanyExperience = () => {
    setFormData((prev) => ({
      ...prev,
      company_experience: [...prev.company_experience, { company: "", years: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please log in.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("token", token);
    for (const key in formData) {
      if (key === "skills" || key === "certifications") {
        formDataToSend.append(key, formData[key].join(","));
      } else if (key === "resume" && formData.resume) {
        formDataToSend.append(key, formData.resume);
      } else if (key === "company_experience") {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }

    const response = await fetch("http://localhost:8000/profile", {
      method: "PUT",
      body: formDataToSend,
    });

    if (response.ok) {
      alert("Profile Updated Successfully!");
    } else {
      alert("Update failed!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="profile-update-dashboard-container">
      <nav className="navbar">
        <button className="nav-button" onClick={() => navigate("/")}>Home</button>
        <h1 className="navbar-title">AI INTERVIEW PREPARATION COACH</h1>
        <div className="nav-right">
          <button className="nav-button" onClick={handleLogout}>Logout</button>
          <button className="nav-button" onClick={() => navigate("/profile-update")}>
            <i className="fas fa-user-edit"></i>
          </button>
        </div>
      </nav>
      <main className="profile-update-main-content">
        <div className="profile-update-container">
          <h2 className="profile-update-title">Update Profile</h2>
          <form onSubmit={handleSubmit} className="profile-update-form">
            <label className="profile-update-label">Total Years of Experience:</label>
            <input
              className="profile-update-input"
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
            />

            <label className="profile-update-label">Company Experience:</label>
            {formData.company_experience.map((exp, index) => (
              <div key={index} className="company-experience">
                <input
                  className="profile-update-input"
                  type="text"
                  name="company"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => handleCompanyExperienceChange(index, e)}
                />
                <input
                  className="profile-update-input"
                  type="text"
                  name="years"
                  placeholder="Years"
                  value={exp.years}
                  onChange={(e) => handleCompanyExperienceChange(index, e)}
                />
              </div>
            ))}
            <button type="button" onClick={addCompanyExperience} className="profile-update-button">
              Add Company Experience
            </button>

            <label className="profile-update-label">Skills:</label>
            <select
              multiple
              className="profile-update-input"
              name="skills"
              onChange={handleMultiSelectChange}
            >
              {skillsOptions.map((skill) => (
                <option key={skill} value={skill} selected={formData.skills.includes(skill)}>
                  {skill}
                </option>
              ))}
            </select>

            <label className="profile-update-label">Preferred Role:</label>
            <select
              className="profile-update-input"
              name="preferred_role"
              value={formData.preferred_role}
              onChange={handleChange}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <label className="profile-update-label">Interest Area:</label>
            <select
              className="profile-update-input"
              name="interest_area"
              value={formData.interest_area}
              onChange={handleChange}
            >
              {interestAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <label className="profile-update-label">Education Qualification:</label>
            <input
              className="profile-update-input"
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
            />

            <label className="profile-update-label">Year of Education:</label>
            <input
              className="profile-update-input"
              type="text"
              name="education_year"
              value={formData.education_year}
              onChange={handleChange}
            />

            <label className="profile-update-label">Certifications:</label>
            <select
              multiple
              className="profile-update-input"
              name="certifications"
              onChange={handleMultiSelectChange}
            >
              {["Certification 1", "Certification 2", "Certification 3", "Others"].map((cert) => (
                <option key={cert} value={cert} selected={formData.certifications.includes(cert)}>
                  {cert}
                </option>
              ))}
            </select>

            <label className="profile-update-label">Resume Upload:</label>
            <input className="profile-update-input" type="file" name="resume" onChange={handleFileChange} />

            <button className="profile-update-button" type="submit">
              Update Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserProfileUpdate;