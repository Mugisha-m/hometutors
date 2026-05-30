import bcrypt from "bcryptjs";
import { config } from "./config";
import prisma from "./prisma";

export const ensureAdminUser = async () => {
  const existing = await prisma.user.findUnique({ where: { phone: config.admin.phone } });

  if (existing) {
    if (existing.role !== "ADMIN" || !existing.adminApproved) {
      await prisma.user.update({
        where: { phone: config.admin.phone },
        data: {
          role: "ADMIN",
          adminApproved: true,
          email: config.admin.email || existing.email
        }
      });
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(config.admin.password, 12);
  await prisma.user.create({
    data: {
      phone: config.admin.phone,
      email: config.admin.email,
      password: hashedPassword,
      role: "ADMIN",
      adminApproved: true
    }
  });
};
