import { getCourses } from "./courseStore";
import { supabase } from "./supabaseClient";

const ENROLLMENTS_KEY = "nomad_sapiens_enrollments_v1";

/**
 * Enrolls a user in a course
 */
export async function enrollUser(userId, courseId, purchasedBumps = []) {
  if (!userId || !courseId) return;

  try {
    // Note: Em um ambiente real com Supabase, precisariamos criar uma tabela relacional ou coluna JSONB
    const { error } = await supabase
      .from('enrollments')
      .upsert([{ user_id: userId, course_id: courseId, purchased_bumps: purchasedBumps }]);
      
    if (error) throw error;
  } catch (e) {
    console.warn("Supabase enrollment failed, using fallback mock", e);
    const local = JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) || "[]");
    const existingIndex = local.findIndex(en => en.user_id === userId && en.course_id === courseId);
    if (existingIndex > -1) {
       const currentBumps = local[existingIndex].purchased_bumps || [];
       local[existingIndex].purchased_bumps = [...new Set([...currentBumps, ...purchasedBumps])];
    } else {
       local.push({ user_id: userId, course_id: courseId, purchased_bumps: purchasedBumps });
    }
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(local));
  }
  
  window.dispatchEvent(new Event("enrollments_updated"));
}

export async function getPurchasedBumps(userId, courseId) {
  try {
    const local = JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) || "[]");
    const enrollment = local.find(en => en.user_id === userId && en.course_id === courseId);
    return enrollment?.purchased_bumps || [];
  } catch (e) {
    return [];
  }
}

/**
 * Checks if a user has access to a specific course
 */
export async function hasCourseAccess(userId, courseId) {
  if (!userId || !courseId) return false;
  
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId);
      
    if (!error && data && data.length > 0) return true;
    if (error) throw error;
  } catch (e) {
    const local = JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) || "[]");
    return local.some(en => en.user_id === userId && en.course_id === courseId);
  }
  
  return false;
}

/**
 * Gets all full Course objects that a user is enrolled in
 */
export async function getUserCourses(userId) {
  if (!userId) return [];
  
  let userCourseIds = [];
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId);
      
    if (!error && data) {
      userCourseIds = data.map(e => e.course_id);
    } else {
      throw error || new Error("Supabase returns empty data");
    }
  } catch (e) {
    const local = JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) || "[]");
    userCourseIds = local.filter(en => en.user_id === userId).map(en => en.course_id);
  }
  
  const allCourses = await getCourses();
  return allCourses.filter(course => userCourseIds.includes(course.id || course.course_id));
}

/**
 * Calculates completion progress for a given course
 * @param {object} course The full course object
 * @returns {number} Percentage between 0 and 100
 */
export function calculateProgress(course) {
  if (!course || !course.modules || course.modules.length === 0) return 0;
  
  const courseId = course.id || course.course_id;
  let totalLessons = 0;
  let completedLessons = 0;
  
  course.modules.forEach(m => {
    if (m.lessons && m.lessons.length > 0) {
      totalLessons += m.lessons.length;
      m.lessons.forEach(l => {
        const isComplete = localStorage.getItem(`nomad_complete_${courseId}_${l.id}`);
        if (isComplete === "true") completedLessons++;
      });
    }
  });
  
  if (totalLessons === 0) return 0;
  
  return Math.round((completedLessons / totalLessons) * 100);
}
