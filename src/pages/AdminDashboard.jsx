import React, { useState, useEffect } from "react";
import { api } from "../api"; // ✅ centralized axios instance
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Warning as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Person as UserIcon,
  BugReportOutlined,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  UserAdd as UserPlusIcon,
  Map as MapPinIcon,
  Schedule as ClockIcon,
  Edit as EditIcon,
  Mail as MailIcon,
  MoreHoriz as MoreHorizontalIcon,
  Add as PlusIcon,
} from "@mui/icons-material";

const AdminDashboard = () => {
  // Tab and UI states
  const [activeTab, setActiveTab] = useState("reports");
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openAddTask, setOpenAddTask] = useState(false);

  // Data states
  const [liveIssues, setLiveIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [adminUpdates, setAdminUpdates] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    activeIssues: 0,
    resolvedToday: 0,
    resolvedTrendPercentage: 0,
  });

  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
  });

  const [newTask, setNewTask] = useState({
    task: "",
    location: "",
    date: "",
    time: "",
    assignedTo: "",
    priority: "medium",
    status: "pending",
  });

  // Fetch data when component mounts
  useEffect(() => {
    fetchDashboardData();
    fetchAdminUpdates();
  }, []);

  // -------------------- API Calls ----------------------

  const fetchDashboardData = async () => {
    try {
      const reportsResponse = await api.get("/api/reports");
      const reportsData = reportsResponse.data;

      const transformedIssues = reportsData.map((report) => ({
        _id: report._id,
        type: report.issueType,
        priority: report.priority || "MEDIUM",
        title: report.details,
        location: report.location,
        time: new Date(report.timestamp).toLocaleString(),
        status: report.status || "pending",
        reportedBy: report.reportedBy || "Anonymous",
      }));

      setLiveIssues(transformedIssues);

      // Update dashboard stats
      setDashboardStats({
        activeIssues: transformedIssues.filter(
          (issue) => issue.status === "pending"
        ).length,
        resolvedToday: transformedIssues.filter((issue) => {
          const today = new Date().toDateString();
          const issueDate = new Date(issue.time).toDateString();
          return issue.status === "resolved" && issueDate === today;
        }).length,
        resolvedTrendPercentage: 15,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchAdminUpdates = async () => {
    try {
      const response = await api.get("/api/admin/updates");
      setAdminUpdates(response.data);
    } catch (error) {
      console.error("Error fetching admin updates:", error);
    }
  };

  const handleResolve = async (report) => {
    try {
      const resolveResponse = await api.post(`/api/reports/${report._id}/resolve`);
      if (resolveResponse.status === 200) {
        await api.post("/api/admin/resolve", {
          reportId: report._id,
          issueType: report.type,
          location: report.location,
        });

        setLiveIssues((prevIssues) =>
          prevIssues.filter((issue) => issue._id !== report._id)
        );

        fetchAdminUpdates();
        console.log("Report resolved successfully");
      }
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  const handleAddUserSubmit = async () => {
    try {
      const response = await api.post("/api/users", newUser);
      setUsers([...users, response.data]);
      handleAddUserClose();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleAddTaskSubmit = async () => {
    try {
      const response = await api.post("/api/maintenance/tasks", newTask);
      setMaintenanceSchedule([...maintenanceSchedule, response.data]);
      handleAddTaskClose();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // -------------------- Dialog Handlers ----------------------

  const handleAddUserOpen = () => setOpenAddUser(true);
  const handleAddUserClose = () => {
    setOpenAddUser(false);
    setNewUser({ name: "", email: "", role: "student", password: "" });
  };

  const handleAddTaskOpen = () => setOpenAddTask(true);
  const handleAddTaskClose = () => {
    setOpenAddTask(false);
    setNewTask({
      task: "",
      location: "",
      date: "",
      time: "",
      assignedTo: "",
      priority: "medium",
      status: "pending",
    });
  };

  const handleNewUserChange = (field) => (e) =>
    setNewUser({ ...newUser, [field]: e.target.value });

  const handleTaskChange = (field) => (e) =>
    setNewTask({ ...newTask, [field]: e.target.value });

  // -------------------- Render Section ----------------------

  const renderUserManagement = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
      <Paper>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6">User Management</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage student and staff accounts
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<UserPlusIcon />}
              onClick={handleAddUserOpen}
            >
              Add User
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={
                          user.role === "Admin"
                            ? "primary"
                            : user.role === "Facility Manager"
                            ? "secondary"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <MailIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <MoreHorizontalIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={openAddUser} onClose={handleAddUserClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={newUser.name}
              onChange={handleNewUserChange("name")}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newUser.email}
              onChange={handleNewUserChange("email")}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newUser.password}
              onChange={handleNewUserChange("password")}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={handleNewUserChange("role")}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddUserClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddUserSubmit}
            disabled={!newUser.name || !newUser.email || !newUser.password}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // -------------------- Main Return ----------------------

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 3,
        width: "100vw",
        display: "flex",
      }}
    >
      {/* Sidebar Tabs */}
      <Box
        sx={{
          width: 200,
          bgcolor: "white",
          borderRight: 1,
          borderColor: "divider",
          py: 2,
        }}
      >
        <Tabs
          orientation="vertical"
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              alignItems: "flex-start",
              textAlign: "left",
              px: 3,
              py: 2,
              "&.Mui-selected": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
            },
          }}
        >
          <Tab
            label="Reports"
            value="reports"
            icon={<BugReportOutlined />}
            iconPosition="start"
          />
          <Tab
            label="Users"
            value="users"
            icon={<UserIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, px: 3 }}>
        {activeTab === "reports" && (
          <Typography variant="h6">Reports Section Coming Soon</Typography>
        )}
        {activeTab === "users" && renderUserManagement()}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
