import React, { useEffect, useState } from "react";
import { getUserCourses, calculateProgress } from "../lib/enrollmentStore";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { Link } from "react-router-dom";
import { GraduationCap, PlayCircle } from "lucide-react";

export default function MyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    if (user?.id) {
      getUserCourses(user.id).then(setEnrollments);
    }
    
    const handleProgress = () => {
      if (user?.id) getUserCourses(user.id).then(setEnrollments);
    };
    window.addEventListener("progress_updated", handleProgress);
    return () => window.removeEventListener("progress_updated", handleProgress);
  }, [user]);

  return (
    <DashboardLayout title="Meus cursos" subtitle="Continue de onde parou.">
      {enrollments.length === 0 ? (
        <div className="nomad-card p-16 text-center">
          <GraduationCap size={48} className="text-[#C05746] mx-auto mb-4" />
          <p className="text-nomad-muted mb-5">Você ainda não está matriculado.</p>
          <Link to="/courses" className="btn-primary">Ver catálogo</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((e) => (
            <Link
              key={e.id || e.course_id}
              to={`/dashboard/courses/${e.id || e.course_id}`}
              className="nomad-card overflow-hidden group block hover:no-underline"
            >
              <div className="aspect-video relative bg-[#232F2A]">
                <img src={e.thumbnailHorizontal || e.thumbnail} alt="" className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <PlayCircle size={60} className="text-white" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-lg text-nomad-dark group-hover:text-[#C05746] transition">
                  {e.title}
                </h3>
                <div className="mt-3 h-2 bg-nomad-sand rounded-full overflow-hidden">
                  <div className="h-full bg-[#2D4A22] transition-all duration-500" style={{ width: `${calculateProgress(e)}%` }} />
                </div>
                <div className="text-xs text-nomad-muted mt-2">{calculateProgress(e)}% concluído</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
