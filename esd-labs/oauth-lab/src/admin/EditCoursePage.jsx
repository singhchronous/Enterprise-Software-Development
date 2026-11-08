// From React Lab 4 (and before). `npm run carry -- ../react-lab4` copies YOUR EditCoursePage.jsx over this
// file (section 01). This lab doesn't change it.
//
// React Lab 4's in-lab task (its §15; the spec was its inlab/CONTRACT.md).
//
// /admin/courses/:id/edit (ADMIN only): the course's form, filled in, saving with
// PUT /api/courses/{id}; and a Delete button (DELETE /api/courses/{id}).
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useCourse } from "../courses/useCourse.js";
import { AddCourseForm } from "../courses/AddCourseForm.jsx";

export function EditCoursePage() {
  throw new Error("TODO — from React Lab 4's in-lab task: run npm run carry (section 01 of the doc)");
}
