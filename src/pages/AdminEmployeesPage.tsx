import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getEmployees } from "../api/admin/employeesApi";
import type { Employee } from "../api/admin/types";
import { parseApiError } from "../utils/apiError";
import PageHeader from "../components/ui/PageHeader";
import EmployeeTable from "../features/admin/EmployeeTable";
import CreateEmployeeModal from "../features/admin/CreateEmployeeModal";
import EditEmployeeModal from "../features/admin/EditEmployeeModal";
import DeleteEmployeeModal from "../features/admin/DeleteEmployeeModal";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Client-side filters
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  async function loadEmployees(p: number) {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployees(p);
      setEmployees(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (err) {
      setError(parseApiError(err, "Failed to load employees"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmployees(0); }, []);

  function handleCreated() {
    setShowCreateModal(false);
    loadEmployees(0);
  }

  // Client-side filtering on current page
  const visibleEmployees = employees.filter((emp) => {
    if (activeFilter === "active" && !emp.active) return false;
    if (activeFilter === "inactive" && emp.active) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      if (!fullName.includes(q) && !emp.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        area="admin"
        title="Employees"
        subtitle="Browse and manage registered employees."
        action={
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + Add employee
          </button>
        }
      />

      {/* Client-side filter bar */}
      <div style={filterBarStyle}>
        <input
          className="form-input"
          style={{ maxWidth: 280 }}
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-input"
          style={{ maxWidth: 160 }}
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
        >
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      {error && <div style={errorBannerStyle}>{error}</div>}

      <EmployeeTable
        employees={visibleEmployees}
        loading={loading}
        hasError={error !== null}
        totalElements={totalElements}
        page={page}
        totalPages={totalPages}
        onPageChange={loadEmployees}
        onEdit={setEditingEmployee}
        onDelete={setDeletingEmployee}
      />

      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSaved={() => { setEditingEmployee(null); loadEmployees(page); }}
        />
      )}

      {deletingEmployee && (
        <DeleteEmployeeModal
          employee={deletingEmployee}
          onClose={() => setDeletingEmployee(null)}
          onDeleted={() => { setDeletingEmployee(null); loadEmployees(page); }}
        />
      )}
    </div>
  );
}

const filterBarStyle: CSSProperties = {
  display: "flex",
  gap: "var(--space-3)",
  marginBottom: "var(--space-5)",
  flexWrap: "wrap",
};

const errorBannerStyle: CSSProperties = {
  background: "var(--color-danger-bg)",
  color: "var(--color-danger-text)",
  border: "1px solid var(--color-danger-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-3) var(--space-4)",
  marginBottom: "var(--space-6)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
};
