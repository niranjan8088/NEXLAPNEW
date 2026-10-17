import http from "http";

const routes = [
  "/admin",
  "/admin/billing",
  "/admin/offers",
  "/admin/orders",
  "/admin/products",
  "/admin/customers",
  "/admin/resellers",
  "/admin/inventory",
  "/admin/notifications",
  "/admin/analytics",
  "/admin/settings",
  "/admin/bookings",
  "/admin/laptop-enquiries",
  "/admin/services",
  "/admin/reports",
];

async function checkRoute(route: string): Promise<{ route: string; status: number }> {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: route,
      headers: {
        Cookie: "nexbyte_admin_session=mock-admin-session-token"
      }
    };
    const req = http.get(options, (res) => {
      resolve({ route, status: res.statusCode || 0 });
    });
    req.on("error", () => {
      resolve({ route, status: 0 });
    });
    req.end();
  });
}

async function run() {
  console.log("Checking Authorized Admin Command Center Routes...");
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`Route ${res.route}: Status ${res.status}`);
  }
}

run();
