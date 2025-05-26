import React, { createContext, useContext, useState, ReactNode } from 'react';

type EmployeeContextType = {
  employeeName: string;
  employeeId: string;
  setEmployeeData: (data: { name: string; id: string }) => void;
};

const defaultContext: EmployeeContextType = {
  employeeName: '',
  employeeId: '',
  setEmployeeData: () => {},
};

const EmployeeContext = createContext<EmployeeContextType>(defaultContext);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
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




// import React, { createContext, useContext, useState } from 'react';

// const EmployeeContext = createContext<any>(null);


// export const EmployeeProvider = ({ children }: any) => {
//   const [employeeName, setEmployeeName] = useState('');
//   const [employeeId, setEmployeeId] = useState('');

//   const setEmployeeData = ({ name, id }: { name: string; id: string }) => {
//   setEmployeeName(name);
//   setEmployeeId(id);
// };


//   return (
//     <EmployeeContext.Provider value={{ employeeName, employeeId, setEmployeeData }}>
//       {children}
//     </EmployeeContext.Provider>
//   );
// };

// export const useEmployee = () => useContext(EmployeeContext);
