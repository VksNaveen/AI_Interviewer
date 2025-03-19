import React, { useState, useEffect } from "react";
import '../Profile.css';


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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({
          ...data,
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
    formDataToSend.append("token", token);
    for (const key in formData) {
      if (key === "skills") {
        formDataToSend.append(key, formData[key].join(","));
      } else if (key === "resume" && formData.resume) {
        formDataToSend.append(key, formData.resume);
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
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Update Profile</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <label className="block">Experience:</label>
        <input className="border p-2 rounded" type="number" name="experience" value={formData.experience} onChange={handleChange} />

        <label className="block">Skills:</label>
        <select multiple className="border p-2 rounded" onChange={handleMultiSelectChange}>
          {skillsOptions.map((skill) => (
            <option key={skill} value={skill} selected={formData.skills.includes(skill)}>
              {skill}
            </option>
          ))}
        </select>

        <label className="block">Preferred Role:</label>
        <select className="border p-2 rounded" name="preferred_role" value={formData.preferred_role} onChange={handleChange}>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <label className="block">Interest Area:</label>
        <select className="border p-2 rounded" name="interest_area" value={formData.interest_area} onChange={handleChange}>
          {interestAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        <label className="block">Education:</label>
        <input className="border p-2 rounded" type="text" name="education" value={formData.education} onChange={handleChange} />

        <label className="block">Certifications:</label>
        <input className="border p-2 rounded" type="text" name="certifications" value={formData.certifications} onChange={handleChange} />

        <label className="block">Resume Upload:</label>
        <input className="border p-2 rounded" type="file" name="resume" onChange={handleFileChange} />

        <button className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-700" type="submit">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default UserProfileUpdate;
