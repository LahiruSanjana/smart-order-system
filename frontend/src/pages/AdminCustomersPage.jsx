import { UsersRound } from "lucide-react";
import { PageHeader } from "./AppPages";

const AdminCustomersPage = () => {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Customers"
        description="Customer management is ready for the user directory endpoint."
      />
      <div className="panel text-center">
        <UsersRound className="mx-auto text-emerald-700" size={34} />
        <h2 className="mt-4">User directory endpoint required</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
          The current backend exposes profile-by-id, signup, login, and delete
          routes, but does not expose GET /users. Add that endpoint to populate
          this page with customer records.
        </p>
      </div>
    </>
  );
};

export default AdminCustomersPage;
