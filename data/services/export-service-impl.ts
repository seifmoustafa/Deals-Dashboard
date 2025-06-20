import type { ExportService } from "@/domain/services/export-service"
import type { User } from "@/domain/entities/user"
import type { Admin } from "@/domain/entities/admin"
import type { Category } from "@/domain/entities/category"
import * as XLSX from "xlsx"

export class ExportServiceImpl implements ExportService {
  async exportUsersToExcel(users: User[]): Promise<Blob> {
    // Map users to export format
    const dataToExport = users.map((user) => ({
      Username: `mogabal${user.id.substring(0, 2)}`,
      "Full Name": user.fullName,
      Email: user.email,
      Phone: user.phone || "",
      Country: user.country || "",
      City: user.city || "",
      "Birth Date": user.dateOfBirth ? this.formatDate(user.dateOfBirth) : "",
      Gender: user.gender || "",
      Status: user.isActive ? "Active" : "Inactive",
      "Created At": this.formatDate(user.createdAt),
    }))

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users")

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    // Convert to Blob
    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  }

  async exportAdminsToExcel(admins: Admin[]): Promise<Blob> {
    // Map admins to export format
    const dataToExport = admins.map((admin) => ({
      "Full Name": admin.full_name,
      Username: admin.username,
      Email: admin.email,
      Role: admin.role === "super" ? "Super Admin" : "Regular Admin",
      Status: admin.is_active ? "Active" : "Inactive",
      "Created At": admin.createdAt ? this.formatDate(admin.createdAt) : "",
      "Updated At": admin.updatedAt ? this.formatDate(admin.updatedAt) : "",
    }))

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admins")

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    // Convert to Blob
    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  }

  async exportCategoriesToExcel(categories: Category[]): Promise<Blob> {
    // Map categories to export format
    const dataToExport = categories.map((category) => ({
      "Category Name": category.title,
      "Number of Stores": category.storeCount || 0,
      Status: category.isActive ? "Active" : "Inactive",
      "Color Code": category.colorCode || "",
      Order: category.order || 0,
      Featured: category.isFeatured ? "Yes" : "No",
      "Created At": category.createdAt ? this.formatDate(category.createdAt) : "",
      "Updated At": category.updatedAt ? this.formatDate(category.updatedAt) : "",
    }))

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories")

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

    // Convert to Blob
    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  }

  private formatDate(dateString: string): string {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }
}
