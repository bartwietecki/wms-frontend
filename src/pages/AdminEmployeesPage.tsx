import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getEmployees } from "../api/admin/employeesApi";
import type { Employee } from "../api/admin/types";
import PageHeader from "../components/ui/PageHeader";
import EmployeeTable from "../features/admin/EmployeeTable";
import CreateEmployeeModal from "../features/admin/CreateEmployeeModal";
import EditEmployeeModal from "../features/admin/EditEmployeeModal";
import DeleteEmployeeModal from "../features/admin/DeleteEmployeeModal";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
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
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmployees(0); }, []);

  function handleCreated() {
    setShowCreateModal(false);
    loadEmployees(0);
  }

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

      {error && <div style={errorBannerStyle}>{error}</div>}

      <EmployeeTable
        employees={employees}
        loading={loading}
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
