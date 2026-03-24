import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";

import type { NavGroup } from "../types";

export const navigationConfig: NavGroup[] = [
  {
    groupLabel: "nav.main",
    items: [
      {
        label: "nav.requests",
        href: "/requests/list",
        icon: <AssignmentOutlinedIcon fontSize="small" />,
        badge: 3,
        allowedRoles: ["EMPLOYEE", "OPS_COORDINATOR", "TECHNICIAN", "TENANT_ADMIN"],
      },
      {
        label: "nav.assets",
        href: "/assets/list",
        icon: <HandymanOutlinedIcon fontSize="small" />,
        allowedRoles: ["EMPLOYEE", "OPS_COORDINATOR", "TECHNICIAN", "TENANT_ADMIN"],
      },
      {
        label: "nav.team",
        href: "/admin/user",
        icon: <PeopleOutlinedIcon fontSize="small" />,
        allowedRoles: ["TENANT_ADMIN"],
      },
    ],
  },
  {
    groupLabel: "nav.analytics",
    items: [
      {
        label: "nav.reports",
        href: "/reports",
        icon: <BarChartOutlinedIcon fontSize="small" />,
        allowedRoles: ["OPS_COORDINATOR", "TENANT_ADMIN"],
        children: [
          {
            label: "nav.reportsOverview",
            href: "/reports/overview",
            icon: <BarChartOutlinedIcon fontSize="small" />,
            allowedRoles: ["OPS_COORDINATOR", "TENANT_ADMIN"],
          },
          {
            label: "nav.reportsPerformance",
            href: "/reports/performance",
            icon: <BarChartOutlinedIcon fontSize="small" />,
            allowedRoles: ["OPS_COORDINATOR", "TENANT_ADMIN"],
          },
        ],
      },
    ],
  },
  {
    groupLabel: "nav.system",
    items: [
      {
        label: "nav.settings",
        href: "/settings",
        icon: <SettingsOutlinedIcon fontSize="small" />,
        children: [
          {
            label: "nav.workflowConfig",
            href: "/settings/workflow",
            icon: <AltRouteOutlinedIcon fontSize="small" />,
            allowedRoles: ["TENANT_ADMIN"],
          },
          {
            label: "nav.slaPolicy",
            href: "/settings/sla",
            icon: <AccessTimeOutlinedIcon fontSize="small" />,
            allowedRoles: ["TENANT_ADMIN"],
          },
          {
            label: "nav.serviceTypes",
            href: "/settings/service-types",
            icon: <CategoryOutlinedIcon fontSize="small" />,
            allowedRoles: ["TENANT_ADMIN"],
          },
        ],
      },
    ],
  },
];
