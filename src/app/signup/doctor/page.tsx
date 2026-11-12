import { redirect } from "next/navigation";

export default function DoctorSignUpRedirect() {
  redirect("/register/doctor");
}

