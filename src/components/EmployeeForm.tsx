import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import './EmployeeForm.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Labels for the frontend
interface Employee { 
  id: number; 
  employeeNumber: string;
  firstName: string;
  lastName: string;
  salutation: string;
  gender: string;
  fullName: string;
  grossSalary: string;
  profileColor: string;
}


const initialState: Employee = {
    id:0,
  employeeNumber: '',
  firstName: '',
  lastName: '',
  salutation: '',
  gender: '',
  fullName: '',
  grossSalary: '',
  profileColor:'',
};



const EmployeeForm: React.FC = () => {
  const [form, setForm] = useState<Employee>(initialState);//holds state of the form
  const [errors, setErrors] = useState<any>({});
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);


  // Handles changes to input or select elements in the form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      let updated = { ...prev, [name]: value };

      // If the changed field is either 'firstName' or 'lastName', update 'fullName'
      if (name === 'firstName' || name === 'lastName') {
        updated.fullName = `${updated.firstName} ${updated.lastName}`.trim();
      }
      // If the changed field is 'salutation', auto-fill the gender field
      if (name === 'salutation') {
        if (value === 'Mr.') updated.gender = 'Male';
        else if (value === 'Ms.' || value === 'Mrs.') updated.gender = 'Female';
        else if (value === 'Mx.') updated.gender = 'Unspecified';
        else updated.gender = '';
      }

      return updated;
    });
  };

  //Handle updates made to gender input
  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, gender: e.target.value }));
  };

  //Handle updates made to profile color input
  const handleColorToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      profileColor: checked ? value : '', 
    }));
  };
  
  //Handle updates made to gross salary input
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // remove all non-digits to conform to requirements
    const formatted = input.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    setForm((prev) => ({ ...prev, grossSalary: formatted }));
  };

  //When cancel button is clicked, clear the forms input
  const handleCancel = () => {
    setForm(initialState);
    setErrors({});
  };

  const validateForm = () => {
    let formErrors: any = {};
    const { employeeNumber, firstName, lastName, salutation, gender, grossSalary } = form;

    if (!employeeNumber) {
        formErrors.employeeNumber = "Employee number is required";
      } else if (isNaN(Number(employeeNumber)) || Number(employeeNumber) < 0) {
        formErrors.employeeNumber = "Employee number must be a positive number";
      }

    if (!firstName) formErrors.firstName = "First name is required";
    if (!lastName) formErrors.lastName = "Last name is required";

    if (!salutation) formErrors.salutation = "Salutation is required";
    if (!gender) formErrors.gender = "Gender is required";

    if (!grossSalary) formErrors.grossSalary = "Gross Salary is required";
    else if (!/^\d{1,3}( \d{3})*$/.test(grossSalary)) formErrors.grossSalary = "Gross salary must be numeric and grouped with spaces (e.g. 1 000 000)";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };


  // Get existing employees from my Db in employees table
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      console.log('Fetch response:', response);
  
      const data = await response.json(); 
      //if data is found
      if (response.ok) {
        if (Array.isArray(data) && data.length > 0) {
          setEmployeeList(data);
        } else {
          console.warn("No employee data found.");
          setEmployeeList([]); 
        }
      } else {
        console.error('Server error response:', data);
        alert(`Failed to fetch employees: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert(`Failed to fetch employees: ${error}`);
    }
  };
  

  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    //When save button is clicked, either add a new entry(POST) or update an exsisting entry(PUT)
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id 
      ? `${API_BASE_URL}/employees/${form.id}` 
      : `${API_BASE_URL}/employees`;
    
  
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
  
      if (response.ok) {
        handleCancel();//  Clear/reset the form
        fetchEmployees();// Refresh the employee list from the backend if the request was successful
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save employee.'}`);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('An unexpected error occurred while saving the employee.');
    }
  };
  

  
  const handleDelete = async (id: number | string) => {
    if (!id || (typeof id === 'string' && id.trim() === '')) {
      alert('Invalid employee ID.');
      return;
    }
  
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        fetchEmployees(); // Refetch the employees because the table has been altered
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete employee.'}`);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('An unexpected error occurred while deleting the employee.');
    }
  };
  
  // const handleEdit = (employee: Employee) => {
  //   setForm(employee);
  // };

  //Called when an employee row is selected and populates the form fields with the selected employee's data for editing
  const handleSelectedRowData = (emp: Employee) => {
    setForm({
      id: emp.id,
      employeeNumber: emp.employeeNumber,
      firstName: emp.firstName,
      lastName: emp.lastName,
      salutation: emp.salutation,
      gender: emp.gender,
      fullName: `${emp.firstName} ${emp.lastName}`.trim(),
      grossSalary: emp.grossSalary,
      profileColor: emp.profileColor,
    });
  };

  //Set form back to inital state
  const clearForm = () => {
    setForm(initialState);
  };
  
  const firstNameRef = useRef<HTMLInputElement>(null);// Using this ref to Programmatically focus the first name input field when a new employee needs to be added
  
  const focusFirstName = () => {
    if (firstNameRef.current) {
      firstNameRef.current.focus();
    }
  };
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);//to toggle the selection of a row
  const [selectedRow, setSelectedRow] = useState<number | null>(null);//to control the color
  
  return (
    <div className="Parent-Container" style={{border:'1px solid #140303' }}>
    
      <div className="employee-table" style={{border:'1px solid #140303' }}>
      {/* Displaying the Table of Employees */}
        <div>
          <h2>Current Employees</h2>
          <button className='add-employees-btn' onClick={() => {
          focusFirstName();
          setForm(initialState);
          setErrors({});
          }}>
          Add Employees</button>

          <table className='Current-Employees-table'>
            <thead>
              <tr>
                <th>Employee #</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Salutation</th>
                <th>Profile Colour</th>
                {/* <th>Pay</th> */}
                <th>Action</th>{/*To hold the delete button for each row */}
              </tr>
            </thead>
            <tbody>
          {/* handling row click */}
          {employeeList.map((emp) => (
          <tr key={emp.id}
          style={{ cursor:"pointer", backgroundColor: emp.profileColor || "white" }}
            onClick={() => {
              setSelectedRowId(prev => (prev === emp.id ? null : emp.id));
              if (selectedRowId !== emp.id) {
                handleSelectedRowData(emp); // populate form with selected rows data
              } else {
                clearForm(); // clear form if clicking again to unselect
              }
            }}
          className={selectedRowId === emp.id ? 'selected-row' : ''}
          >
          <td data-label="Employee #">{emp.employeeNumber}</td>
          <td data-label="First Name">{emp.firstName}</td>
          <td data-label="Last Name">{emp.lastName}</td>
          <td data-label="Salutation">{emp.salutation}</td>
          {/* <td data-label="Pay">{emp.grossSalary}</td> */}
          <td data-label="Profile Colours">{Array.isArray(emp.profileColor) ? emp.profileColor.join(', ') : emp.profileColor}</td>
          <td data-label="Actions">
            {/* <button
              style={{ color: 'lightblue',  border: 'none', padding:0, margin:10, cursor:'pointer'}}
              onClick={() => handleEdit(emp)}>
              <i className="fas fa-pencil-alt"></i>
              </button> */}
            <button
              style={{ color: 'red',  border: 'none', padding:0, margin:10, cursor:'pointer'}}
              onClick={(e) =>{
               e.stopPropagation(); // prevent row selection when clicking delete
              console.log('Attempting to delete ID:', emp.id);
              handleDelete(emp.id)}}>
              <i className="fas fa-trash-alt"></i> 
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  </div>
      </div>

      <div className="employee-form shadow-box" style={{border:'1px solid #140303' }}>
          <h2>Employee Information</h2>
            <form onSubmit={handleSave}>
            <div className="form-grid">
              {/* Left Column - Required Fields */}
              <div className="left-section">
                <label>First Name(s)<span className="required">*</span></label>
                <input
                  name="firstName"
                  placeholder='Enter alphabets only'
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  ref={firstNameRef}
                  pattern="[A-Za-z\s]*"
                  required
                />
                {errors.firstName && <span className="error">{errors.firstName}</span>}
                <label>Last Name<span className="required">*</span></label>
                <input
                  name="lastName"
                  placeholder='Enter alphabets only'
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  pattern="[A-Za-z\s]*"
                  required
                />
                {errors.lastName && <span className="error">{errors.lastName}</span>}

                <label>Salutation<span className="required">*</span></label>
                <select name="salutation" value={form.salutation} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Mx.">Mx.</option>
                </select>
                {errors.salutation && <span className="error">{errors.salutation}</span>}

                <label>Gender<span className="required">*</span></label>
                <div className="radio-group">
                  <label><input type="radio" name="gender" value="Male" checked={form.gender === 'Male'} onChange={handleGenderChange} /> Male</label>
                  <label><input type="radio" name="gender" value="Female" checked={form.gender === 'Female'} onChange={handleGenderChange} /> Female</label>
                  <label><input type="radio" name="gender" value="Unspecified" checked={form.gender === 'Unspecified'} onChange={handleGenderChange} /> Unspecified</label>
                </div>
                {errors.gender && <span className="error">{errors.gender}</span>}
              
                <label>Employee #<span className="required">*</span></label>
                <input
                  name="employeeNumber"
                  type="number"
                  value={form.employeeNumber}
                  onChange={handleChange}
                  min="0"
                  required
                  
                />
                {errors.employeeNumber && <span className="error">{errors.employeeNumber}</span>}
              </div>
              {/* Right Column - Optional Fields */}
              <div className="right-section">
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} readOnly />

                <label>Gross Salary $PY</label>
                <input
                  name="grossSalary"
                  value={form.grossSalary}
                  onChange={handleSalaryChange}
                  placeholder="e.g. 1 000 000"
                />
                {errors.grossSalary && <span className="error">{errors.grossSalary}</span>}

                <label>Profile Colour(s)</label>
                <div className="checkbox-group">
                {['Blue', 'Green', 'Red', 'Default'].map((color) => (
                <label key={color}>
                  <input
                    type="checkbox"
                    value={color}
                    checked={form.profileColor===color}
                    onChange={handleColorToggle}
                  />
                  {color}
                </label>
                ))}
                </div>
              </div>
            </div>

            <div className="actions">
              <button className='save-btn' type="submit" style={{ backgroundColor: form.profileColor?.toLowerCase() || 'green' }}>
                Save
              </button>
              <button className='cancel-btn' type="button" onClick={handleCancel}>Cancel</button>
            </div>
            </form>
      </div>
    </div>
  );
};
export default EmployeeForm;
