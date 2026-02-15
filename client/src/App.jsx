import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import BookAppointment from './pages/patient/BookAppointment';
import Overview from './pages/patient/Overview';

import Profile from './pages/patient/Profile';
import PatientList from './pages/nurse/PatientList';
import VitalsManager from './pages/nurse/VitalsManager';
import NurseAppointments from './pages/nurse/NurseAppointments';
import NurseBookAppointment from './pages/nurse/NurseBookAppointment';

import ReceptionistAppointments from './pages/receptionist/ReceptionistAppointments';
import ReceptionistBookAppointment from './pages/receptionist/ReceptionistBookAppointment';
import PatientLog from './pages/receptionist/PatientLog';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorCompleted from './pages/doctor/DoctorCompleted';
import DoctorReferrals from './pages/doctor/DoctorReferrals';

import AdminOverview from './pages/admin/AdminOverview';
import StaffManager from './pages/admin/StaffManager';
import DepartmentManager from './pages/admin/DepartmentManager';

import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyPrescriptions from './pages/pharmacy/PharmacyPrescriptions';

import LaboratoryDashboard from './pages/laboratory/LaboratoryDashboard';
import LaboratoryPrescriptions from './pages/laboratory/LaboratoryPrescriptions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login/patient" replace />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="patient" element={<Overview />} />
          <Route path="patient/profile" element={<Profile />} />
          <Route path="patient/book" element={<BookAppointment />} />
          {/* Nurse Routes */}
          <Route path="nurse" element={<Navigate to="/dashboard/nurse/appointments" replace />} />
          <Route path="nurse/appointments" element={<NurseAppointments />} />
          <Route path="nurse/book" element={<NurseBookAppointment />} />
          <Route path="nurse/patients" element={<PatientList />} />
          <Route path="nurse/vitals" element={<VitalsManager />} />

          {/* Receptionist Routes */}
          <Route path="receptionist" element={<Navigate to="/dashboard/receptionist/appointments" replace />} />
          <Route path="receptionist/appointments" element={<ReceptionistAppointments />} />
          <Route path="receptionist/book" element={<ReceptionistBookAppointment />} />
          <Route path="receptionist/log" element={<PatientLog />} />

          {/* Doctor Routes */}
          <Route path="doctor" element={<DoctorDashboard />} />
          <Route path="doctor/appointments" element={<DoctorAppointments />} />
          <Route path="doctor/completed" element={<DoctorCompleted />} />
          <Route path="doctor/referrals" element={<DoctorReferrals />} />

          {/* Admin Routes */}
          <Route path="admin" element={<AdminOverview />} />
          <Route path="admin/staff" element={<StaffManager />} />
          <Route path="admin/departments" element={<DepartmentManager />} />

          {/* Pharmacy Routes */}
          <Route path="pharmacy" element={<PharmacyDashboard />} />
          <Route path="pharmacy/prescriptions" element={<PharmacyPrescriptions />} />

          {/* Laboratory Routes */}
          <Route path="laboratory" element={<LaboratoryDashboard />} />
          <Route path="laboratory/prescriptions" element={<LaboratoryPrescriptions />} />

          {/* Fallback for other roles for now */}
          <Route path=":role" element={<Overview />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;




