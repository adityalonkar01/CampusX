(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    if (document.body?.dataset?.role === "STUDENT_USER" && window.CampusXRoleRouter) {
      window.CampusXRoleRouter.guardPage("STUDENT_USER");
    }
  });
})();
