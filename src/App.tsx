import React, { useEffect, useState } from 'react';
import './App.css';
import EmployeeForm from './components/EmployeeForm';

function App() {
  const [employees, setEmployees] = useState([]);

  return (

    <div className="App">
      {/* <h1>Employee Information</h1> */}
      <EmployeeForm />
    </div>
  );
}

export default App;
