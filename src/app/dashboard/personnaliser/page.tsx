import { redirect } from "next/navigation";

// La personnalisation a été intégrée dans « Mon programme ».
// On redirige les anciens liens / favoris vers la nouvelle page.
export default function PersonnaliserRedirect() {
  redirect("/dashboard/programme");
}
