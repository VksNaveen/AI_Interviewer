import React, { useState, useEffect } from "react";

const UserProfileUpdate = () => {
  const [formData, setFormData] = useState({
    experience: "",
    skills: [],
    preferred_role: "",
    interest_area: "",
    education: "",
    degree: "",
    certifications: "",
    projects: "",
    linkedin: "",
    github: "",
    expected_salary: "",
    location_preference: "",
    resume: null,
  });

  const skillsOptions = ["Python", "Java", "React", "Machine Learning"];
  const roleOptions = ["Software Engineer", "Data Scientist"];
  const interestAreas = ["AI/ML", "Web Development"];
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
        method: "POST", // ✅ Use POST instead of GET
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }), // ✅ Send token in the request body
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({
          experience: data.experience || "",
          skills: data.skills || [],
          preferred_role: data.preferred_role || "",
          interest_area: data.interest_area || "",
          education: data.education || "",
          degree: data.degree || "",
          certifications: data.certifications || "",
          projects: data.projects || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
          expected_salary: data.expected_salary || "",
          location_preference: data.location_preference || "",
          resume: null, // Reset resume field to avoid uncontrolled input warning
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
    const selectedSkills = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, skills: selectedSkills }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, resume: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please log in.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("token", token); // ✅ Send token in PUT request as well
    for (const key in formData) {
      if (key === "skills") {
        formDataToSend.append(key, formData[key].join(",")); // Convert array to string
      } else if (key === "resume" && formData.resume) {
        formDataToSend.append(key, formData.resume); // Handle file separately
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

  return (
    <div className="container">
      <h2>Update Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>Experience:</label>
        <input type="number" name="experience" value={formData.experience} onChange={handleChange} />

        <label>Skills:</label>
        <select multiple onChange={handleMultiSelectChange}>
          {skillsOptions.map((skill) => (
            <option key={skill} value={skill} selected={formData.skills.includes(skill)}>
              {skill}
            </option>
          ))}
        </select>

        <label>Preferred Role:</label>
        <select name="preferred_role" value={formData.preferred_role} onChange={handleChange}>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <label>Interest Area:</label>
        <select name="interest_area" value={formData.interest_area} onChange={handleChange}>
          {interestAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        <label>Education:</label>
        <input type="text" name="education" value={formData.education} onChange={handleChange} />

        <label>Certifications:</label>
        <input type="text" name="certifications" value={formData.certifications} onChange={handleChange} />

        <label>Resume Upload:</label>
        <input type="file" name="resume" onChange={handleFileChange} />

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default UserProfileUpdate;
