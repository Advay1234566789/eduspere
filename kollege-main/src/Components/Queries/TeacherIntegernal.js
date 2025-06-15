import { useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { TableHeader } from "../Table";
import ErrorStrip from "../ErrorStrip";

const InternalResultForm = () => {
  // Default evaluation criteria (can be customized by the teacher)
  const defaultCriteria = [
    { id: "assignment", label: "Assignment", max: 100 },
    { id: "attendance", label: "Attendance", max: 100 },
    { id: "viva", label: "Viva", max: 100 },
    { id: "cp", label: "CP", max: 100 },
  ];
  
  // State for evaluation criteria; teacher can edit these
  const [evaluationCriteria, setEvaluationCriteria] = useState(defaultCriteria);
  const [criteriaEditable, setCriteriaEditable] = useState(false);

  // Generate 10 dummy student records based on current evaluation criteria.
  // Each student gets a field for each evaluation criterion (initialized to 0).
  const generateDummyStudents = () => {
    const names = [
      "Alice", "Bob", "Charlie", "David", "Eva",
      "Frank", "Grace", "Hannah", "Ian", "Julia"
    ];
    return names.map(name => {
      const student = { name };
      evaluationCriteria.forEach(crit => {
        student[crit.id] = 0;
      });
      student.total = 0;
      return student;
    });
  };

  // State for the dummy student marks.
  const [students, setStudents] = useState(generateDummyStudents());
  // Toggle marks editing mode.
  const [marksEditable, setMarksEditable] = useState(true);
  // For any errors (if needed).
  const [error, setError] = useState("");

  // Handle change of a student's mark.
  const handleStudentMarkChange = (e) => {
    const index = parseInt(e.target.dataset.index, 10);
    const { name, value } = e.target;
    // Update the student's mark for the given criteria field.
    const updatedStudent = { ...students[index], [name]: Number(value) };
    // Recalculate the total by summing each evaluation criterion.
    updatedStudent.total = evaluationCriteria.reduce((sum, crit) => {
      return sum + Number(updatedStudent[crit.id] || 0);
    }, 0);
    const newStudents = students.map((stu, i) => (i === index ? updatedStudent : stu));
    setStudents(newStudents);
  };

  // Handle changes to the evaluation criteria fields (label or max marks).
  const handleCriteriaChange = (e, index) => {
    const { name, value } = e.target;
    const newCriteria = evaluationCriteria.map((crit, i) => {
      if (i === index) {
        return { ...crit, [name]: name === "max" ? Number(value) : value };
      }
      return crit;
    });
    setEvaluationCriteria(newCriteria);
  };

  // Reinitialize student records based on (possibly updated) evaluation criteria.
  const resetStudents = () => {
    setStudents(generateDummyStudents());
  };

  // Simulate saving marks (replace this with an API call if needed).
  const saveMarks = (e) => {
    e.preventDefault();
    setMarksEditable(false);
    alert("Marks saved successfully!");
  };

  // Calculate total maximum marks available.
  const totalMax = evaluationCriteria.reduce((sum, crit) => sum + Number(crit.max), 0);

  return (
    <main className="internal bg-gray-900 text-white min-h-screen p-6">
      <h2 className="mb-4 mt-3 text-4xl font-bold underline decoration-2 underline-offset-4">
        Internal Marks Entry &amp; Evaluation Setup
      </h2>
      
      {/* Evaluation Criteria Configuration Section */}
      <section className="evaluation-criteria mb-6">
        <h3 className="text-2xl font-semibold mb-2">Evaluation Criteria</h3>
        <button
          type="button"
          className="mb-4 flex items-center gap-2 rounded-md border border-blue-500 bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700 focus:bg-blue-700"
          onClick={() => setCriteriaEditable(!criteriaEditable)}
        >
          {criteriaEditable ? "Lock Criteria" : "Edit Criteria"}
        </button>
        {criteriaEditable ? (
          <div className="criteria-form space-y-4">
            {evaluationCriteria.map((crit, index) => (
              <div key={crit.id} className="flex items-center gap-4">
                <label className="w-32">Label:</label>
                <input
                  type="text"
                  name="label"
                  value={crit.label}
                  onChange={(e) => handleCriteriaChange(e, index)}
                  className="rounded bg-gray-800 p-1 text-white"
                />
                <label className="w-32">Max Marks:</label>
                <input
                  type="number"
                  name="max"
                  min="0"
                  value={crit.max}
                  onChange={(e) => handleCriteriaChange(e, index)}
                  className="w-20 rounded bg-gray-800 p-1 text-white"
                />
              </div>
            ))}
            <button
              type="button"
              className="mt-2 flex items-center gap-2 rounded-md border border-green-500 bg-green-600 px-4 py-2 font-semibold hover:bg-green-700 focus:bg-green-700"
              onClick={() => {
                setCriteriaEditable(false);
                resetStudents();
              }}
            >
              Save Criteria &amp; Reset Students
            </button>
          </div>
        ) : (
          <div className="criteria-display space-y-1">
            {evaluationCriteria.map((crit) => (
              <p key={crit.id}>
                {crit.label}: Max {crit.max} marks
              </p>
            ))}
          </div>
        )}
      </section>

      {/* Student Marks Entry Section */}
      <section className="internal__body">
        {error && <ErrorStrip error={error} />}
        <form className="internal_body_form">
          <div className="my-4 w-full overflow-auto rounded-md border-2 border-gray-700 shadow-lg">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2">Student</th>
                  {evaluationCriteria.map((crit) => (
                    <th key={crit.id} className="p-2">
                      {crit.label} <br /> (out of {crit.max})
                    </th>
                  ))}
                  <th className="p-2">Total <br /> (out of {totalMax})</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index} className="border-t border-gray-600 hover:bg-gray-800">
                    <td className="p-2 text-left">{student.name}</td>
                    {evaluationCriteria.map((crit) => (
                      <td key={crit.id} className="p-2 text-center">
                        <input
                          className="w-full rounded bg-gray-800 p-1 text-white"
                          type="number"
                          required
                          min="0"
                          max={crit.max}
                          disabled={!marksEditable}
                          data-index={index}
                          name={crit.id}
                          value={student[crit.id]}
                          onChange={handleStudentMarkChange}
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      <input
                        className="w-full rounded bg-gray-700 p-1 text-white"
                        type="number"
                        required
                        disabled
                        value={student.total}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {marksEditable ? (
            <div className="flex gap-4">
              <button
                type="button"
                className="flex h-10 w-auto items-center gap-2 rounded-md border border-blue-500 bg-blue-600 px-6 py-2 font-semibold hover:bg-blue-700 focus:bg-blue-700"
                onClick={saveMarks}
              >
                <FaPlus /> Save Marks
              </button>
              <button
                type="button"
                className="flex h-10 w-auto items-center gap-2 rounded-md border border-red-500 bg-red-600 px-6 py-2 font-semibold hover:bg-red-700 focus:bg-red-700"
                onClick={resetStudents}
              >
                <FaTrash /> Reset Marks
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="flex h-10 w-auto items-center gap-2 rounded-md border border-green-500 bg-green-600 px-6 py-2 font-semibold hover:bg-green-700 focus:bg-green-700 mt-4"
              onClick={() => setMarksEditable(true)}
            >
              <FaEdit /> Edit Marks
            </button>
          )}
        </form>
      </section>
    </main>
  );
};

export default InternalResultForm;