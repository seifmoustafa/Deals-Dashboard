import type { User } from "../entities/user"
import type { Admin } from "../entities/admin"
import type { Category } from "../entities/category"

export interface ExportService {
  exportUsersToExcel(users: User[]): Promise<Blob>
  exportAdminsToExcel(admins: Admin[]): Promise<Blob>
  exportCategoriesToExcel(categories: Category[]): Promise<Blob>
}
