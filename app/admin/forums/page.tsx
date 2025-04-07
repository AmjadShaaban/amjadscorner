"use client";
import CreateCategoryForm from "@/components/admin/forums/CreateCategoryForm";
import CreateSubcategoryForm from "@/components/admin/forums/CreateSubcategoryForm";
import ForumsStructureTree from "@/components/admin/forums/ForumsStructureTree";
import RoleGuard from "@/components/auth/RoleGuard";
import { useCategories, useSubcategories } from "@/lib/hooks/admin/forums";
import { UserRole } from "@/types/roles";

const ForumsAdminPage = () => {
  const { data: categories = [], isLoading: loadingCategories } =
    useCategories();
  const { data: subcategories = [], isLoading: loadingSubcategories } =
    useSubcategories();
  const loading = loadingCategories || loadingSubcategories;

  return (
    <RoleGuard role={UserRole.ADMIN}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white rounded-b-xl">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            Forums Admin Dashboard
          </h1>

          <CreateCategoryForm />

          <CreateSubcategoryForm categories={categories} />

          <ForumsStructureTree
            categories={categories}
            subcategories={subcategories}
            loading={loading}
          />
        </div>
      </div>
    </RoleGuard>
  );
};

export default ForumsAdminPage;
