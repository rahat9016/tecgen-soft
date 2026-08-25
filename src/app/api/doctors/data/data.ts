import { DoctorStatus, IDoctor } from "../types";

export const doctors: IDoctor[] = [
  {
    id: 1,
    doctorId: "BK202509180",
    fullName: "John Smith",
    gender: "Male",
    contactNumber: "+880162570629",
    email: "john.smith@gmail.com",
    bookingType: "Onsite",
    status: DoctorStatus.ACTIVE,

    image: "/doctors/doctor1.jpg",
    department: { id: 1, name: "Cardiology" },
    specialization: "MBBS, MO (Cord), FACC (USA), FRCP (Glasgow)",
    designation: "Senior Consultant & Coordinator",

    areaOfExpertise: [
      "Balloon Valvuloplasty (PTMC)",
      "Mitral Stenosis Treatment",
      "Peripheral Angioplasty",
      "Coronary Angioplasty",
      "Primary PCI",
      "Chronic Total Occlusion",
      "Multi Vessel Complex Angioplasty",
    ],
  },
  {
    id: 3,
    doctorId: "BK202509180",
    fullName: "John Smith",
    gender: "Male",
    contactNumber: "+880162570629",
    email: "john.smith@gmail.com",
    bookingType: "Onsite",
    status: DoctorStatus.ACTIVE,

    image: "/doctors/doctor1.jpg",
    department: { id: 1, name: "Cardiology" },
    specialization: "MBBS, MO (Cord), FACC (USA), FRCP (Glasgow)",
    designation: "Senior Consultant & Coordinator",

    areaOfExpertise: [
      "Balloon Valvuloplasty (PTMC)",
      "Mitral Stenosis Treatment",
      "Peripheral Angioplasty",
      "Coronary Angioplasty",
      "Primary PCI",
      "Chronic Total Occlusion",
      "Multi Vessel Complex Angioplasty",
    ],
  },
  {
    id: 4,
    doctorId: "BK202509180",
    fullName: "John Smith",
    gender: "Male",
    contactNumber: "+880162570629",
    email: "john.smith@gmail.com",
    bookingType: "Onsite",
    status: DoctorStatus.ACTIVE,

    image: "/doctors/doctor1.jpg",
    department: { id: 1, name: "Cardiology" },
    specialization: "MBBS, MO (Cord), FACC (USA), FRCP (Glasgow)",
    designation: "Senior Consultant & Coordinator",

    areaOfExpertise: [
      "Balloon Valvuloplasty (PTMC)",
      "Mitral Stenosis Treatment",
      "Peripheral Angioplasty",
      "Coronary Angioplasty",
      "Primary PCI",
      "Chronic Total Occlusion",
      "Multi Vessel Complex Angioplasty",
    ],
  },
  {
    id: 2,
    doctorId: "BK202509181",
    fullName: "Farzana Rahman",
    gender: "Female",
    contactNumber: "+8801712345678",
    email: "farzana.rahman@gmail.com",
    bookingType: "Online",
    status: DoctorStatus.ACTIVE,

    image: "/doctors/doctor2.jpg",
    department: { id: 2, name: "Neurology" },
    specialization: "MBBS, FCPS (Neuro)",
    designation: "Associate Consultant",

    areaOfExpertise: [
      "Epilepsy Management",
      "Stroke Treatment",
      "Neurocritical Care",
      "Headache & Migraine",
      "Nerve Disorders",
    ],
  },
];
