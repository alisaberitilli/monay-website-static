'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Search, Video, Phone, User, Star, Plus, Filter } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  avatar: string;
  location: string;
  distance: number;
  acceptsInsurance: boolean;
  languages: string[];
  education: string;
  experience: number;
  availableSlots: TimeSlot[];
  consultationFee: number;
  virtualConsultation: boolean;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  type: 'in-person' | 'virtual';
}

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'virtual';
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  location?: string;
  reason: string;
  notes?: string;
  cost: number;
  insuranceCovered: number;
}

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<'all' | 'in-person' | 'virtual'>('all');
  const [activeTab, setActiveTab] = useState<'book' | 'appointments'>('book');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  const specialties = [
    { id: 'all', name: 'All Specialties' },
    { id: 'primary-care', name: 'Primary Care' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'dermatology', name: 'Dermatology' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'psychiatry', name: 'Psychiatry' },
    { id: 'gynecology', name: 'Gynecology' },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'dentistry', name: 'Dentistry' }
  ];

  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Primary Care',
      rating: 4.9,
      reviews: 324,
      avatar: '/api/placeholder/100/100',
      location: 'Downtown Medical Center',
      distance: 1.2,
      acceptsInsurance: true,
      languages: ['English', 'Spanish'],
      education: 'MD, Harvard Medical School',
      experience: 12,
      consultationFee: 200,
      virtualConsultation: true,
      availableSlots: [
        { date: '2024-10-01', time: '09:00 AM', available: true, type: 'in-person' },
        { date: '2024-10-01', time: '02:00 PM', available: true, type: 'virtual' },
        { date: '2024-10-02', time: '10:30 AM', available: true, type: 'in-person' },
        { date: '2024-10-03', time: '03:00 PM', available: true, type: 'virtual' }
      ]
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      rating: 4.8,
      reviews: 156,
      avatar: '/api/placeholder/100/100',
      location: 'Heart Health Institute',
      distance: 2.5,
      acceptsInsurance: true,
      languages: ['English', 'Mandarin'],
      education: 'MD, Johns Hopkins',
      experience: 15,
      consultationFee: 350,
      virtualConsultation: true,
      availableSlots: [
        { date: '2024-10-02', time: '11:00 AM', available: true, type: 'in-person' },
        { date: '2024-10-03', time: '01:00 PM', available: true, type: 'virtual' },
        { date: '2024-10-04', time: '09:30 AM', available: true, type: 'in-person' }
      ]
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      rating: 4.7,
      reviews: 289,
      avatar: '/api/placeholder/100/100',
      location: 'Skin Care Clinic',
      distance: 1.8,
      acceptsInsurance: true,
      languages: ['English', 'Spanish', 'Portuguese'],
      education: 'MD, Stanford University',
      experience: 8,
      consultationFee: 275,
      virtualConsultation: false,
      availableSlots: [
        { date: '2024-10-01', time: '01:30 PM', available: true, type: 'in-person' },
        { date: '2024-10-02', time: '10:00 AM', available: true, type: 'in-person' },
        { date: '2024-10-04', time: '02:30 PM', available: true, type: 'in-person' }
      ]
    }
  ];

  const appointments: Appointment[] = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Primary Care',
      date: '2024-10-01',
      time: '09:00 AM',
      type: 'in-person',
      status: 'upcoming',
      location: 'Downtown Medical Center',
      reason: 'Annual checkup',
      cost: 200,
      insuranceCovered: 160
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      date: '2024-09-15',
      time: '02:00 PM',
      type: 'virtual',
      status: 'completed',
      reason: 'Follow-up consultation',
      notes: 'Prescribed new medication, follow up in 3 months',
      cost: 350,
      insuranceCovered: 280
    },
    {
      id: '3',
      doctorName: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      date: '2024-10-05',
      time: '01:30 PM',
      type: 'in-person',
      status: 'upcoming',
      location: 'Skin Care Clinic',
      reason: 'Skin consultation',
      cost: 275,
      insuranceCovered: 220
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' ||
                           doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  const filteredAppointments = appointments.filter(appointment => {
    const matchesType = selectedAppointmentType === 'all' || appointment.type === selectedAppointmentType;
    return matchesType;
  });

  const bookAppointment = (doctor: Doctor, timeSlot: TimeSlot) => {
    console.log('Booking appointment with', doctor.name, 'at', timeSlot.date, timeSlot.time);
    // Reset selections
    setSelectedDoctor(null);
    setSelectedTimeSlot(null);
    // Show success message or redirect
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Healthcare Appointments</h1>
          <p className="text-gray-600">Book appointments with healthcare providers and manage your medical visits</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'book', label: 'Book Appointment', icon: Plus },
            { id: 'appointments', label: 'My Appointments', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Book Appointment Tab */}
        {activeTab === 'book' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search doctors or specialties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {specialties.map(specialty => (
                    <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Doctors List */}
            <div className="space-y-4">
              {filteredDoctors.map(doctor => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{doctor.name}</h3>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm text-gray-600">
                                {doctor.rating} ({doctor.reviews} reviews)
                              </span>
                            </div>
                          </div>
                          <p className="text-blue-600 font-medium mb-1">{doctor.specialty}</p>
                          <p className="text-sm text-gray-600 mb-2">{doctor.education}</p>
                          <p className="text-sm text-gray-600 mb-2">{doctor.experience} years experience</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {doctor.location} ({doctor.distance} mi)
                            </div>
                            {doctor.virtualConsultation && (
                              <div className="flex items-center">
                                <Video className="h-4 w-4 mr-1" />
                                Virtual consultations available
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {doctor.languages.map(language => (
                              <span key={language} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {language}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">
                              ${doctor.consultationFee}
                            </span>
                            {doctor.acceptsInsurance && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Insurance accepted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Available Time Slots */}
                    <div className="lg:w-80">
                      <h4 className="font-semibold mb-3">Available Times</h4>
                      <div className="space-y-2">
                        {doctor.availableSlots.slice(0, 4).map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setSelectedTimeSlot(slot);
                            }}
                            className="w-full p-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{slot.date}</div>
                                <div className="text-sm text-gray-600">{slot.time}</div>
                              </div>
                              <div className="flex items-center gap-1">
                                {slot.type === 'virtual' ? (
                                  <Video className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <MapPin className="h-4 w-4 text-green-600" />
                                )}
                                <span className="text-xs text-gray-500 capitalize">{slot.type}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button className="w-full mt-3 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View all available times →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex gap-4">
                <select
                  value={selectedAppointmentType}
                  onChange={(e) => setSelectedAppointmentType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {filteredAppointments.map(appointment => (
                <div key={appointment.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-blue-600 font-medium mb-1">{appointment.specialty}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center">
                          {appointment.type === 'virtual' ? (
                            <>
                              <Video className="h-4 w-4 mr-1" />
                              Virtual
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 mr-1" />
                              {appointment.location}
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Cost: <span className="font-medium">${appointment.cost}</span>
                        </span>
                        <span className="text-green-600">
                          Insurance covered: <span className="font-medium">${appointment.insuranceCovered}</span>
                        </span>
                        <span className="text-red-600">
                          Your cost: <span className="font-medium">${appointment.cost - appointment.insuranceCovered}</span>
                        </span>
                      </div>
                    </div>
                    <div className="ml-6 space-y-2">
                      {appointment.status === 'upcoming' && (
                        <>
                          {appointment.type === 'virtual' && (
                            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              Join Video Call
                            </button>
                          )}
                          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Reschedule
                          </button>
                          <button className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'completed' && (
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Book Follow-up
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Confirmation Modal */}
        {selectedDoctor && selectedTimeSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Appointment</h3>
              <div className="space-y-3 mb-6">
                <div>
                  <strong>Doctor:</strong> {selectedDoctor.name}
                </div>
                <div>
                  <strong>Specialty:</strong> {selectedDoctor.specialty}
                </div>
                <div>
                  <strong>Date:</strong> {selectedTimeSlot.date}
                </div>
                <div>
                  <strong>Time:</strong> {selectedTimeSlot.time}
                </div>
                <div>
                  <strong>Type:</strong> {selectedTimeSlot.type === 'virtual' ? 'Virtual Consultation' : 'In-Person Visit'}
                </div>
                <div>
                  <strong>Location:</strong> {selectedTimeSlot.type === 'virtual' ? 'Video Call' : selectedDoctor.location}
                </div>
                <div>
                  <strong>Cost:</strong> ${selectedDoctor.consultationFee}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedDoctor(null);
                    setSelectedTimeSlot(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => bookAppointment(selectedDoctor, selectedTimeSlot)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}