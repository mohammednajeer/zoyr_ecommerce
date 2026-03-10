import React, { useEffect, useState } from 'react';
import './VehicleAddEdit.css';
import SideBar from '../../Sidebar/SideBar';
import { createVehicle, updateVehicle } from '../../../AdminAPI/adminApi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../api/api';

/* ── Validation rules ── */
function validate(data, isEdit) {
  const errs = {};

  if (!data.brand.trim())
    errs.brand = "Brand is required";
  else if (data.brand.trim().length < 2)
    errs.brand = "Brand must be at least 2 characters";

  if (!data.model.trim())
    errs.model = "Model is required";
  else if (data.model.trim().length < 1)
    errs.model = "Model name is required";

  const yr = parseInt(data.year);
  if (!data.year)
    errs.year = "Year is required";
  else if (isNaN(yr) || yr < 1900 || yr > new Date().getFullYear() + 1)
    errs.year = `Year must be between 1900–${new Date().getFullYear() + 1}`;

  if (!data.fuel.trim())
    errs.fuel = "Fuel type is required";

  const km = parseInt(data.kmCover);
  if (!data.kmCover && data.kmCover !== 0)
    errs.kmCover = "KMs covered is required";
  else if (isNaN(km) || km < 0)
    errs.kmCover = "Enter a valid non-negative number";

  const price = parseInt(data.price);
  if (!data.price)
    errs.price = "Price is required";
  else if (isNaN(price) || price <= 0)
    errs.price = "Price must be a positive number";

  return errs;
}

function VehicleAddEdit() {
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', fuel: '',
    kmCover: '', price: '', status: 'active',
  });
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await api.get(`products/${id}/`);
        setFormData(res.data);
        if (res.data.image) setPreview(res.data.image);
      } catch (err) { console.error(err); }
    }
    load();
  }, [id]);

  /* ── Change + live validation ── */
  function handleChange(e) {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (touched[name]) {
      const errs = validate(updated, isEdit);
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errs = validate(formData, isEdit);
    setErrors(prev => ({ ...prev, [name]: errs[name] }));
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault();
    const allTouched = Object.keys(formData).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(formData, isEdit);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the errors before saving");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (image) data.append('image', image);

    try {
      if (isEdit) {
        await updateVehicle(id, data);
        toast.dark('Vehicle updated');
      } else {
        await createVehicle(data);
        toast.dark('Vehicle added');
      }
      navigate('/VehicleListing');
    } catch (err) {
      /* Surface server-side errors if returned */
      if (err.response?.data) {
        const serverErrs = err.response.data;
        const mapped = {};
        Object.keys(serverErrs).forEach(k => {
          mapped[k] = Array.isArray(serverErrs[k]) ? serverErrs[k][0] : serverErrs[k];
        });
        setErrors(mapped);
        toast.error("Please fix the highlighted errors");
      } else {
        toast.error("Something went wrong");
      }
    }
  }

  /* ── Helper: field with validation UI ── */
  function Field({ label, name, placeholder, type = "text", colSpan }) {
    const hasError = touched[name] && errors[name];
    const isValid  = touched[name] && !errors[name] && formData[name];
    return (
      <div className={`form-row ${colSpan ? "col-span-" + colSpan : ""}`}>
        <label className={hasError ? "lbl-error" : isValid ? "lbl-valid" : ""}>
          {label}
          {hasError && <span className="vae-err-msg">{errors[name]}</span>}
          {isValid  && <span className="vae-valid-tick">✓</span>}
        </label>
        <input
          name={name}
          type={type}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={hasError ? "input-err" : isValid ? "input-ok" : ""}
          required
        />
      </div>
    );
  }

  return (
    <div className="vae-cont">
      <SideBar />
      <div className="vae-body">

        {/* Back */}
        <button className="vae-back" onClick={() => navigate('/VehicleListing')}>
          <span className="vae-back-arr">←</span>
          Vehicle Listings
        </button>

        {/* Header */}
        <div className="vae-header">
          <span className="vae-eyebrow">{isEdit ? 'Editing Entry' : 'New Entry'}</span>
          <h1 className="vae-main-title">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
        </div>

        {/* Form */}
        <form className="vae-form" onSubmit={handleSubmit} noValidate>

          {/* LEFT — spec sheet */}
          <div className="vae-spec-sheet">

            {/* Identity */}
            <div className="vae-section section-identity">
              <div className="vae-section-label">Identity</div>
              <div className="vae-fields-row">
                <Field label="Brand" name="brand" placeholder="e.g. Porsche" />
                <Field label="Model" name="model" placeholder="e.g. 911 Carrera" />
              </div>
            </div>

            {/* Specifications */}
            <div className="vae-section section-specs">
              <div className="vae-section-label">Specifications</div>
              <div className="vae-fields-row cols-3">
                <Field label="Year"        name="year"    placeholder={`${new Date().getFullYear()}`} type="number" />
                <Field label="Fuel Type"   name="fuel"    placeholder="Petrol" />
                <Field label="KMs Covered" name="kmCover" placeholder="12000" type="number" />
              </div>
            </div>

            {/* Pricing & Status */}
            <div className="vae-section section-pricing">
              <div className="vae-section-label">Pricing &amp; Status</div>
              <div className="vae-fields-row">

                {/* Price with validation */}
                {(() => {
                  const hasError = touched.price && errors.price;
                  const isValid  = touched.price && !errors.price && formData.price;
                  return (
                    <div className="form-row">
                      <label className={hasError ? "lbl-error" : isValid ? "lbl-valid" : ""}>
                        Price (USD)
                        {hasError && <span className="vae-err-msg">{errors.price}</span>}
                        {isValid  && <span className="vae-valid-tick">✓</span>}
                      </label>
                      <input
                        name="price" type="number"
                        value={formData.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="185000"
                        className={hasError ? "input-err" : isValid ? "input-ok" : ""}
                        required
                      />
                    </div>
                  );
                })()}

                {/* Status — no validation needed */}
                <div className="form-row">
                  <label>Status</label>
                  <div className="select-wrap">
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT — image panel */}
          <div className="vae-image-panel">
            <div className="vae-image-panel-head">Vehicle Image</div>

            <div className="vae-img-preview">
              {preview
                ? <img src={preview} alt="preview" />
                : (
                  <div className="vae-img-placeholder">
                    <div className="vae-img-ph-icon">📷</div>
                    <span>No image selected</span>
                  </div>
                )
              }
            </div>

            <div className="vae-image-upload-area">
              <div className="form-row">
                <label>
                  Upload Image
                  <span className="vae-img-hint">JPG / PNG · max 5 MB</span>
                </label>
                <input type="file" accept="image/*" onChange={handleFile} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="vae-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate('/VehicleListing')}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default VehicleAddEdit;