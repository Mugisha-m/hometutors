import app from "./app";
import bcrypt from "bcrypt";
import prisma from "./prisma";

const port = Number(process.env.PORT || 4000);

const adminCredentials = {
  phone: "0799399575",
  password: "Aa-2507832829;",
  email: "mugisharutijanaalbert@gmail.com"
};

const ensureAdminUser = async () => {
  const existing = await prisma.user.findUnique({ where: { phone: adminCredentials.phone } });
  if (existing) {
    if (existing.role !== "ADMIN" || !existing.adminApproved) {
      await prisma.user.update({
        where: { phone: adminCredentials.phone },
        data: { role: "ADMIN", adminApproved: true }
      });
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
  await prisma.user.create({
    data: {
      phone: adminCredentials.phone,
      email: adminCredentials.email,
      password: hashedPassword,
      role: "ADMIN",
      adminApproved: true
    }
  });
};

ensureAdminUser().then(() => {
  app.listen(port, () => {
    console.log(`HomeTutors backend running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error("Failed to ensure admin user:", error);
  process.exit(1);
});
