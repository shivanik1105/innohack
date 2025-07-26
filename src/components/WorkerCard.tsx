import React from "react";

type Worker = {
  name: string;
  phone: string;
  experience: number;
  jobTypes: string[];
  location?: string;
  photoUrl?: string;
  language: string;
};

type Props = {
  worker: Worker;
};

const translateJobType = (type: string) => {
  const translations: Record<string, string> = {
    plumber: "Plumber",
    electrician: "Electrician",
    carpenter: "Carpenter",
    painter: "Painter",
    mechanic: "Mechanic",
  };
  return translations[type] ?? type;
};

const WorkerCard = ({ worker }: Props) => {
  return (
    <div className="p-6 max-w-md mx-auto border rounded-lg shadow-md bg-white space-y-4">
      {/* Header Info */}
      <div className="flex items-center space-x-4">
        <img
          src={worker.photoUrl || "/default-profile.png"}
          alt={worker.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{worker.name}</h2>
          <p className="text-sm text-gray-500">{worker.location ?? "Location not available"}</p>
        </div>
      </div>

      {/* Job Types as Badges */}
      <div className="flex flex-wrap gap-2">
        {worker.jobTypes.map((type) => (
          <span
            key={type}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
          >
            {translateJobType(type)}
          </span>
        ))}
      </div>

      {/* Contact Info */}
      <div className="text-sm text-gray-700 space-y-1">
        <p><strong>Phone:</strong> {worker.phone}</p>
        <p><strong>Experience:</strong> {worker.experience} years</p>
      </div>
    </div>
  );
};

export default WorkerCard;
