(function () {
  "use strict";

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function strongEnough(password) {
    return password.length >= 10 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password);
  }

  async function submitStudentRegistration(form) {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    if (!supabase) return { ok: false, handled: false, message: "Supabase is not configured yet." };

    const data = Object.fromEntries(new FormData(form).entries());
    const email = String(data.email || data.username || "").trim().toLowerCase();
    const username = String(data.username || "").trim().toLowerCase();
    const password = String(data.password || "");
    const confirm = String(data.confirmPassword || "");
    const firstName = String(data.firstName || "").trim();
    const middleName = String(data.middleName || "").trim();
    const lastName = String(data.lastName || "").trim();
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
    const studentId = String(data.studentId || "").trim();
    const admissionNumber = String(data.admissionNo || "").trim();
    const phone = String(data.phone || "").trim();
    const dob = String(data.dob || "").trim();
    const gender = String(data.gender || "").trim();

    if (!studentId || !admissionNumber || !firstName || !lastName || !dob || !gender || !email || !phone || !password || !confirm) {
      return { ok: false, handled: true, message: "Complete all required fields." };
    }
    if (!validEmail(email)) return { ok: false, handled: true, message: "Enter a valid email address." };
    if (username && username !== email) return { ok: false, handled: true, message: "Username / Email must match the registered email address." };
    if (password !== confirm) return { ok: false, handled: true, message: "Password and confirm password must match." };
    if (!strongEnough(password)) {
      return { ok: false, handled: true, message: "Password must be at least 10 characters and include uppercase, lowercase, a number and a symbol." };
    }
    if (!data.declaration) return { ok: false, handled: true, message: "You must accept the declaration." };

    /*
     * Registration metadata is consumed by the auth.users trigger installed by
     * migration 011. This avoids unauthenticated browser inserts into RLS-protected
     * profiles/student_account_requests when email confirmation is enabled.
     */
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_category: "STUDENT",
          full_name: fullName,
          student_id: studentId,
          admission_number: admissionNumber,
          first_name: firstName,
          middle_name: middleName || null,
          last_name: lastName,
          dob,
          gender,
          phone
        }
      }
    });

    if (signUpError) return { ok: false, handled: true, message: signUpError.message || "Unable to submit the registration request." };
    if (!signUpData?.user) return { ok: false, handled: true, message: "Registration could not be completed. Please try again." };

    if (signUpData.session) {
      await supabase.auth.signOut();
    }

    return {
      ok: true,
      handled: true,
      message: "Registration request submitted. Check your email if verification is required. Student Portal access activates only after Institute Admin approval."
    };
  }

  window.CampusXStudentRegistration = { submitStudentRegistration };
})();
