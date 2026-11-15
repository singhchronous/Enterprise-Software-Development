import { useState } from "react";

const FIELDS = [
  { name: "code", label: "Code", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "credits", label: "Credits", type: "number" },
  { name: "capacity", label: "Capacity", type: "number" },
  { name: "description", label: "Description", type: "textarea" },
];

const EMPTY = {
  code: "",
  title: "",
  department: "",
  credits: "",
  capacity: "",
  description: "",
};

export function AddCourseForm({ onAdd }) {
  const [values, setValues] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onAdd({
        code: values.code,
        title: values.title,
        department: values.department,
        credits: Number(values.credits),
        capacity: Number(values.capacity),
        description: values.description === "" ? null : values.description,
      });
      setValues(EMPTY);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const fieldErrors = error?.fieldErrors ?? {};

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>Add a course</h2>
      {FIELDS.map((field) => {
        const id = `course-${field.name}`;
        const errorId = `${id}-error`;
        const fieldError = fieldErrors[field.name];
        const props = {
          id,
          name: field.name,
          value: values[field.name],
          onChange: handleChange,
          "aria-invalid": fieldError ? "true" : undefined,
          "aria-describedby": fieldError ? errorId : undefined,
        };
        return (
          <div key={field.name}>
            <label htmlFor={id}>{field.label}</label>
            {field.type === "textarea" ? (
              <textarea {...props} />
            ) : (
              <input type={field.type} {...props} />
            )}
            {fieldError && <p id={errorId}>{fieldError}</p>}
          </div>
        );
      })}
      {error && <p role="alert">{error.message}</p>}
      <button type="submit" disabled={submitting}>
        Add course
      </button>
    </form>
  );
}
