import React, { useState } from "react";
import agreementTemplates from "../data/agreementTemplates";

export default function AgreementSystem() {
  const [type, setType] = useState("residential");
  const [formData, setFormData] = useState({});
  const [output, setOutput] = useState("");

  const template = agreementTemplates[type];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateAgreement = () => {
    let text = template.template;

    Object.keys(formData).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      text = text.replace(regex, formData[key]);
    });

    setOutput(text);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Agreement Generator</h2>

      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setFormData({});
          setOutput("");
        }}
        style={{ marginBottom: "20px", padding: "8px" }}
      >
        {Object.keys(agreementTemplates).map((key) => (
          <option key={key} value={key}>
            {agreementTemplates[key].title}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", gap: "30px" }}>
        <div style={{ flex: 1 }}>
          <h3>Fill Details</h3>
          {template.fields.map((field) => (
            <div key={field.name} style={{ marginBottom: "15px" }}>
              <label>{field.label}</label>
              <input
                type="text"
                name={field.name}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
          ))}
          <button onClick={generateAgreement}>
            Generate Agreement
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Preview</h3>
          <div
            style={{
              whiteSpace: "pre-line",
              background: "#f5f5f5",
              padding: "15px",
              minHeight: "300px"
            }}
          >
            {output || "Agreement preview will appear here..."}
          </div>
        </div>
      </div>
    </div>
  );
}