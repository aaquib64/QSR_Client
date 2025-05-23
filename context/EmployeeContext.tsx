import React, { createContext, useContext, useState } from 'react';

const EmployeeContext = createContext<any>(null);

export const EmployeeProvider = ({ children }: any) => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const setEmployeeData = ({ name, id }: { name: string; id: string }) => {
  setEmployeeName(name);
  setEmployeeId(id);
};


  return (
    <EmployeeContext.Provider value={{ employeeName, employeeId, setEmployeeData }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => useContext(EmployeeContext);
