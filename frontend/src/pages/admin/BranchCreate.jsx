import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { PageHeader } from "../AppPages";
import {
    useCreateBranchMutation,
    useDeleteBranchMutation,
    useGetBranchesQuery,
} from "../../lib/redux/apiSlice";

function useFormFields(initial) {
    const [fields, setFields] = useState(initial);
    const update = (name) => (event) =>
        setFields((current) => ({ ...current, [name]: event.target.value }));
    return [fields, update];
}


function ErrorState({ message, onRetry }) {
    return (
        <div className="panel flex items-center justify-between gap-4 text-rose-700">
            <span>{message}</span>
            <Button variant="outline" onClick={onRetry}>
                <RefreshCw size={15} /> Retry
            </Button>
        </div>
    );
}

const BranchCreate = () => {
    const {
        data: branches = [],
        isLoading,
        isError,
        refetch,
    } = useGetBranchesQuery();
    const [createBranch, { isLoading: saving }] = useCreateBranchMutation();
    const [deleteBranch] = useDeleteBranchMutation();
    const [fields, update] = useFormFields({
        name: "",
        code: "",
        address: "",
        maxCapacity: "100",
    });
    const [open, setOpen] = useState(false);
    async function submit(event) {
        event.preventDefault();
        await createBranch({
            ...fields,
            maxCapacity: Number(fields.maxCapacity),
        }).unwrap();
        setOpen(false);
    }

    return (
        <>
            <PageHeader
                eyebrow="Administration"
                title="Branches"
                description="Monitor branch capacity, workload, and delivery coverage."
                action={null}
            />
            <div className="mb-5 flex justify-end">
                <Button
                    onClick={() => setOpen(!open)}
                    className="bg-emerald-700 hover:bg-emerald-800"
                >
                    <Plus size={16} /> Add branch
                </Button>
            </div>
            {open && (
                <form
                    onSubmit={submit}
                    className="panel mb-5 grid gap-3 sm:grid-cols-2"
                >
                    <input
                        required
                        placeholder="Branch name"
                        value={fields.name}
                        onChange={update("name")}
                        className="rounded-lg border p-3"
                    />
                    <input
                        required
                        placeholder="Code"
                        value={fields.code}
                        onChange={update("code")}
                        className="rounded-lg border p-3"
                    />
                    <input
                        required
                        placeholder="Address"
                        value={fields.address}
                        onChange={update("address")}
                        className="rounded-lg border p-3 sm:col-span-2"
                    />
                    <input
                        required
                        type="number"
                        placeholder="Max capacity"
                        value={fields.maxCapacity}
                        onChange={update("maxCapacity")}
                        className="rounded-lg border p-3"
                    />
                    <Button disabled={saving} type="submit">
                        {saving ? "Saving..." : "Save branch"}
                    </Button>
                </form>
            )}
            {isLoading && <div className="panel">Loading branches...</div>}
            {isError && (
                <ErrorState message="Could not load branches." onRetry={refetch} />
            )}
            {!isLoading && !isError && (
                <div className="grid gap-4 md:grid-cols-2">
                    {branches.map((branch) => (
                        <div className="panel" key={branch._id || branch.id}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2>{branch.name}</h2>
                                    <p className="text-sm text-slate-500">
                                        {branch.code} · {branch.address}
                                    </p>
                                </div>
                                <button
                                    className="text-rose-600"
                                    aria-label={`Delete ${branch.name}`}
                                    onClick={() => deleteBranch(branch._id || branch.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="mt-6 flex justify-between text-sm">
                                <span>
                                    Workload <strong>{branch.currentWorkload || 0}</strong>
                                </span>
                                <span>
                                    Capacity <strong>{branch.maxCapacity || 0}</strong>
                                </span>
                                <span>{branch.isActive === false ? "Inactive" : "Active"}</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-slate-100">
                                <div
                                    className="h-2 rounded-full bg-emerald-600"
                                    style={{
                                        width: `${Math.min(100, ((branch.currentWorkload || 0) / (branch.maxCapacity || 1)) * 100)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default BranchCreate;