import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import './EmployeeForm.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';


interface Employee {
  id: number; 
  employeeNumber: string;
  firstName: string;
  lastName: string;
  salutation: string;
  gender: string;
  fullName: string;
  grossSalary: string;
  profileColors: string[];
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
  profileColors: [],
};

const EmployeeForm: React.FC = () => {
  const [form, setForm] = useState<Employee>(initialState);
  const [errors, setErrors] = useState<any>({});
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);


  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      let updated = { ...prev, [name]: value };

      if (name === 'firstName' || name === 'lastName') {
        updated.fullName = `${updated.firstName} ${updated.lastName}`.trim();
      }

      if (name === 'salutation') {
        if (value === 'Mr.') updated.gender = 'Male';
        else if (value === 'Ms.' || value === 'Mrs.') updated.gender = 'Female';
        else if (value === 'Mx.') updated.gender = 'Unspecified';
        else updated.gender = '';
      }

      return updated;
    });
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, gender: e.target.value }));
  };


  const handleColorToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      profileColors: checked ? [value] : []
    }));
  };
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // remove all non-digits
    const formatted = input.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    setForm((prev) => ({ ...prev, grossSalary: formatted }));
  };

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



const fetchEmployees = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`);
    const data = await response.json();
    setEmployeeList(data);
  } catch (error) {
    console.error('Error fetching employees:', error);
    alert('An unexpected error occurred while fetching employees.');
  }
};


  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
  
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
        handleCancel();
        fetchEmployees();
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
        fetchEmployees(); // Refresh the employee list
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
      profileColors: emp.profileColors || [],
    });
  };

  const clearForm = () => {
    setForm(initialState);
  };

    //Ref for the employee number input field
  const employeeNumberRef = useRef<HTMLInputElement>(null);
  const focusEmployeeNumber = () => {
    if (employeeNumberRef.current) {
      employeeNumberRef.current.focus();
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
        focusEmployeeNumber();
        setForm(initialState);
        setErrors({});
        }}
        >Add Employees</button>
        <table className='Current-Employees-table'>
          <thead>
            <tr>
              <th>Employee #</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Salutation</th>
              <th>Profile Colour</th>
              <th>Pay</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
        {/* handling row click */}
        {employeeList.map((emp) => (
         
        <tr key={emp.id}
          
        style={{ cursor:"pointer", backgroundColor: emp.profileColors[0] || "white" }}
          onClick={() => {
            setSelectedRowId(prev => (prev === emp.id ? null : emp.id));
            if (selectedRowId !== emp.id) {
              handleSelectedRowData(emp); // populate form
            } else {
              clearForm(); // optional: clear form if clicking again to unselect
            }
          }}
        className={selectedRowId === emp.id ? 'selected-row' : ''}

        >
         <td data-label="Employee #">{emp.employeeNumber}</td>
          <td data-label="First Name">{emp.firstName}</td>
          <td data-label="Last Name">{emp.lastName}</td>
          <td data-label="Salutation">{emp.salutation}</td>
          <td data-label="Pay">{emp.grossSalary}</td>

          <td data-label="Profile Colours">{Array.isArray(emp.profileColors) ? emp.profileColors.join(', ') : emp.profileColors}</td>
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
            <label>Employee #<span className="required">*</span></label>
            <input
              name="employeeNumber"
              type="number"
              value={form.employeeNumber}
              onChange={handleChange}
              min="0"
              required
              ref={employeeNumberRef}
            />
            {errors.employeeNumber && <span className="error">{errors.employeeNumber}</span>}

            <label>First Name(s)<span className="required">*</span></label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              pattern="[A-Za-z\s]*"
              required
            />
            {errors.firstName && <span className="error">{errors.firstName}</span>}

            <label>Last Name<span className="required">*</span></label>
            <input
              name="lastName"
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
                checked={form.profileColors.includes(color)}
                onChange={handleColorToggle}
              />
              {color}
            </label>
             ))}
            </div>
          </div>
        </div>

        <div className="actions">
          <button className='save-btn' type="submit" style={{ backgroundColor: form.profileColors[0]?.toLowerCase() || 'green' }}>
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
