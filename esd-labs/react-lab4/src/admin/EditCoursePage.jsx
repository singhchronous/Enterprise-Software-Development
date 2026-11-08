// IN-LAB TASK (section 15) — leave this until the lab. inlab/CONTRACT.md is the spec.
//
// /admin/courses/:id/edit (ADMIN only): the course's form, filled in, saving with
// PUT /api/courses/{id}; and a Delete button (DELETE /api/courses/{id}).
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useCourse } from "../courses/useCourse.js";
import { AddCourseForm } from "../courses/AddCourseForm.jsx";

export function EditCoursePage() {
  throw new Error("TODO: the in-lab task (section 15, inlab/CONTRACT.md)");
}
