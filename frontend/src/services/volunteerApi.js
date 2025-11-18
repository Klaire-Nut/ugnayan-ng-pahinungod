// src/services/volunteerApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Send OTP to user's email
 * @param {string} email - User's email address
 * @returns {Promise} Response with OTP (in development mode)
 */
export const sendOTP = async (email) => {
  try {
    const response = await api.post('/volunteers/send-otp/', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to send OTP' };
  }
};

/**
 * Verify OTP
 * @param {string} email - User's email address
 * @param {string} otp - OTP code to verify
 * @returns {Promise} Verification result
 */
export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post('/volunteers/verify-otp/', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'OTP verification failed' };
  }
};

/**
 * Register new volunteer with OTP verification
 * @param {Object} volunteerData - Complete volunteer form data
 * @param {string} otp - Verified OTP code
 * @returns {Promise} Response data
 */
export const registerVolunteerWithOTP = async (volunteerData, otp) => {
  try {
    // Transform form data to match Django model field names
    const transformedData = {
      email: volunteerData.email,
      otp: otp,
      data_consent: volunteerData.dataConsent,
      last_name: volunteerData.lastName,
      first_name: volunteerData.firstName,
      middle_name: volunteerData.middleName,
      nickname: volunteerData.nickname,
      age: volunteerData.age,
      sex: volunteerData.sex,
      birthdate: volunteerData.birthdate
        ? new Date(volunteerData.birthdate).toISOString().split('T')[0]
        : null,
      indigenous_affiliation: volunteerData.indigenousAffiliation || '',
      mobile_number: volunteerData.mobileNumber,
      facebook_link: volunteerData.facebookLink,
      hobbies: volunteerData.hobbies,
      organizations: volunteerData.organizations,
      street_barangay: volunteerData.streetBarangay,
      city_municipality: volunteerData.cityMunicipality,
      province: volunteerData.province,
      region: volunteerData.region,
      same_as_permanent: volunteerData.sameAsPermanent,
      up_street_barangay: volunteerData.upStreetBarangay || '',
      up_city_municipality: volunteerData.upCityMunicipality || '',
      up_province: volunteerData.upProvince || '',
      up_region: volunteerData.upRegion || '',
      affiliation: volunteerData.affiliation,
      degree_program: volunteerData.degreeProgram || '',
      year_level: volunteerData.yearLevel || '',
      college: volunteerData.college || '',
      shs_type: volunteerData.shsType || '',
      grad_bachelors: volunteerData.gradBachelors || '',
      first_college: volunteerData.firstCollege || '',
      first_grad: volunteerData.firstGrad || '',
      first_up: volunteerData.firstUP || '',
      emer_name: volunteerData.emerName || '',
      emer_relation: volunteerData.emerRelation || '',
      emer_contact: volunteerData.emerContact || '',
      emer_address: volunteerData.emerAddress || '',
      faculty_dept: volunteerData.facultyDept || '',
      constituent_unit: volunteerData.constituentUnit || '',
      alumni_degree: volunteerData.alumniDegree || '',
      year_grad: volunteerData.yearGrad || '',
      first_grad_college: volunteerData.firstGradCollege || '',
      first_grad_up: volunteerData.firstGradUP || '',
      occupation: volunteerData.occupation || '',
      retire_designation: volunteerData.retireDesignation || '',
      retire_office: volunteerData.retireOffice || '',
      staff_office: volunteerData.staffOffice || '',
      staff_position: volunteerData.staffPosition || '',
      volunteer_programs: volunteerData.volunteerPrograms || [],
      affirmative_action_subjects: volunteerData.affirmativeActionSubjects || [],
      volunteer_status: volunteerData.volunteerStatus,
      tagapag_ugnay: volunteerData.tagapagUgnay,
      other_organization: volunteerData.otherOrganization,
      organization_name: volunteerData.organizationName || '',
      how_did_you_hear: volunteerData.howDidYouHear || '',
    };

    const response = await api.post('/volunteers/register-with-otp/', transformedData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

/**
 * Register new volunteer (without OTP - original method)
 * @param {Object} volunteerData - Complete volunteer form data
 * @returns {Promise} Response data
 */
export const registerVolunteer = async (volunteerData) => {
  try {
    const transformedData = {
      email: volunteerData.email,
      data_consent: volunteerData.dataConsent,
      last_name: volunteerData.lastName,
      first_name: volunteerData.firstName,
      middle_name: volunteerData.middleName,
      nickname: volunteerData.nickname,
      age: volunteerData.age,
      sex: volunteerData.sex,
      birthdate: volunteerData.birthdate
        ? new Date(volunteerData.birthdate).toISOString().split('T')[0]
        : null,
      indigenous_affiliation: volunteerData.indigenousAffiliation || '',
      mobile_number: volunteerData.mobileNumber,
      facebook_link: volunteerData.facebookLink,
      hobbies: volunteerData.hobbies,
      organizations: volunteerData.organizations,
      street_barangay: volunteerData.streetBarangay,
      city_municipality: volunteerData.cityMunicipality,
      province: volunteerData.province,
      region: volunteerData.region,
      same_as_permanent: volunteerData.sameAsPermanent,
      up_street_barangay: volunteerData.upStreetBarangay || '',
      up_city_municipality: volunteerData.upCityMunicipality || '',
      up_province: volunteerData.upProvince || '',
      up_region: volunteerData.upRegion || '',
      affiliation: volunteerData.affiliation,
      degree_program: volunteerData.degreeProgram || '',
      year_level: volunteerData.yearLevel || '',
      college: volunteerData.college || '',
      shs_type: volunteerData.shsType || '',
      grad_bachelors: volunteerData.gradBachelors || '',
      first_college: volunteerData.firstCollege || '',
      first_grad: volunteerData.firstGrad || '',
      first_up: volunteerData.firstUP || '',
      emer_name: volunteerData.emerName || '',
      emer_relation: volunteerData.emerRelation || '',
      emer_contact: volunteerData.emerContact || '',
      emer_address: volunteerData.emerAddress || '',
      faculty_dept: volunteerData.facultyDept || '',
      constituent_unit: volunteerData.constituentUnit || '',
      alumni_degree: volunteerData.alumniDegree || '',
      year_grad: volunteerData.yearGrad || '',
      first_grad_college: volunteerData.firstGradCollege || '',
      first_grad_up: volunteerData.firstGradUP || '',
      occupation: volunteerData.occupation || '',
      retire_designation: volunteerData.retireDesignation || '',
      retire_office: volunteerData.retireOffice || '',
      staff_office: volunteerData.staffOffice || '',
      staff_position: volunteerData.staffPosition || '',
      volunteer_programs: volunteerData.volunteerPrograms || [],
      affirmative_action_subjects: volunteerData.affirmativeActionSubjects || [],
      volunteer_status: volunteerData.volunteerStatus,
      tagapag_ugnay: volunteerData.tagapagUgnay,
      other_organization: volunteerData.otherOrganization,
      organization_name: volunteerData.organizationName || '',
      how_did_you_hear: volunteerData.howDidYouHear || '',
    };

    const response = await api.post('/volunteers/register/', transformedData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

/**
 * Get all volunteers (admin only)
 */
export const getVolunteers = async () => {
  try {
    const response = await api.get('/volunteers/list/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch volunteers' };
  }
};

/**
 * Get single volunteer by email
 */
export const getVolunteer = async (email) => {
  try {
    const response = await api.get(`/volunteers/${email}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Volunteer not found' };
  }
};

/**
 * Update volunteer information
 */
export const updateVolunteer = async (email, updateData) => {
  try {
    const response = await api.patch(`/volunteers/${email}/update/`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Update failed' };
  }
};

export default {
  sendOTP,
  verifyOTP,
  registerVolunteer,
  registerVolunteerWithOTP,
  getVolunteers,
  getVolunteer,
  updateVolunteer,
};