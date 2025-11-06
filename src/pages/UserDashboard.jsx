import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api"; // ✅ centralized API import
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
} from "@mui/material";
import {
  Favorite as HeartIcon,
  LocationOn as MapPinIcon,
  Shield as ShieldIcon,
  Notifications as BellIcon,
  Person as UserIcon,
  Add as PlusIcon,
  AccessTime as ClockIcon,
  Reply as ReplyIcon,
  Chat as MessageIcon,
  Close as CloseIcon,
  Wc as WcIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

// Mock data for UI consistency
const washroomStatus = [
  { name: "Science Building - F1", status: "good", lastUpdated: "2 hours ago" },
  { name: "Library - Ground Floor", status: "maintenance", lastUpdated: "30 mins ago" },
  { name: "Main Building - F3", status: "issue", lastUpdated: "45 mins ago" },
];

const discussions = [
  {
    id: 1,
    title: "Hygiene supplies shortage in Building A",
    content: "Soap dispensers missing again in restrooms on 2nd floor.",
    category: "hygiene",
    author: "Anonymous #1",
    timeAgo: "2 hours ago",
    likes: 8,
    replies: 12,
  },
  {
    id: 2,
    title: "Appreciate the maintenance team!",
    content: "Quick fixes lately — thank you!",
    category: "appreciation",
    author: "Anonymous #2",
    timeAgo: "4 hours ago",
    likes: 15,
    replies: 3,
    resolved: true,
  },
];

const categories = [
  { name: "All Posts", count: 6 },
  { name: "Hygiene", count: 1 },
  { name: "Privacy", count: 1 },
  { name: "Urgent", count: 1 },
  { name: "Suggestions", count: 1 },
  { name: "Appreciation", count: 1 },
  { name: "Feedback", count: 1 },
];

const availableTags = ["hygiene", "privacy", "urgent", "suggestions", "appreciation", "feedback"];

function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discussionForm, setDiscussionForm] = useState({ title: "", description: "", tags: [] });

  const [recentReports, setRecentReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [adminUpdates, setAdminUpdates] = useState([]);

  useEffect(() => {
    fetchReports();
    fetchResolvedReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch recent reports (no auth)
      const recentRes = await api.get("/api/reports");
      setRecentReports(recentRes.data);

      // Fetch user-specific reports if logged in
      if (token) {
        const myRes = await api.get("/api/my-reports");
        setMyReports(myRes.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchResolvedReports = async () => {
    try {
      const response = await api.get("/api/admin/updates");
      setAdminUpdates(response.data);
    } catch (error) {
      console.error("Error fetching admin updates:", error);
    }
  };

  const handleConfirmResolution = async (reportId) => {
    try {
      await api.post("/api/admin/resolve-confirm", { reportId });
      setAdminUpdates((prev) => prev.filter((update) => update.reportId !== reportId));
      alert("Report marked as resolved and removed.");
    } catch (error) {
      console.error("Error confirming resolution:", error);
      alert("Error confirming resolution. Please try again.");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      hygiene: "primary",
      privacy: "secondary",
      urgent: "error",
      suggestions: "info",
      appreciation: "success",
      feedback: "warning",
    };
    return colors[category] || "default";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return "#4caf50";
      case "maintenance":
        return "#ff9800";
      case "issue":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "good":
        return <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} />;
      case "maintenance":
        return <WarningIcon fontSize="small" sx={{ color: "#ff9800" }} />;
      case "issue":
        return <ErrorIcon fontSize="small" sx={{ color: "#f44336" }} />;
      default:
        return <WcIcon fontSize="small" sx={{ color: "#9e9e9e" }} />;
    }
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleTagToggle = (event, newTags) => {
    setDiscussionForm((prev) => ({ ...prev, tags: newTags }));
  };

  const handleSubmitDiscussion = () => {
    console.log("New discussion:", discussionForm);
    setDiscussionForm({ title: "", description: "", tags: [] });
    setIsModalOpen(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", width: "100vw" }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HeartIcon color="primary" />
            <Typography variant="h6" color="primary" fontWeight="bold">
              <Button color="inherit" onClick={() => navigate("/")}>
                MenstruCare
              </Button>
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button startIcon={<HeartIcon />} color="inherit" onClick={() => navigate("/report")}>
              Report Issue
            </Button>
            <Button startIcon={<ShieldIcon />} color="inherit">
              Dashboard
            </Button>
            <Button startIcon={<BellIcon />} color="inherit">
              Audit
            </Button>
            <Button color="inherit">Login</Button>
            <Button variant="contained" color="primary" sx={{ borderRadius: 28 }}>
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          User Dashboard
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Overview of facility status and recent reports
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
          <Tab label="Dashboard" />
          <Tab label="Discussion Forum" />
        </Tabs>

        {/* Dashboard Tab */}
        {activeTab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Recent Reports, Admin Updates, My Reports, Washroom Status */}
            {/* (unchanged UI code here for brevity — same as your version) */}
          </Box>
        )}

        {/* Discussion Forum Tab */}
        {activeTab === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* (unchanged UI for discussions) */}
          </Box>
        )}
      </Container>

      {/* New Discussion Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Start New Discussion
            <IconButton onClick={() => setIsModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <TextField
              label="Discussion Title"
              fullWidth
              value={discussionForm.title}
              onChange={(e) =>
                setDiscussionForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={discussionForm.description}
              onChange={(e) =>
                setDiscussionForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <ToggleButtonGroup value={discussionForm.tags} onChange={handleTagToggle} multiple>
                {availableTags.map((tag) => (
                  <ToggleButton
                    key={tag}
                    value={tag}
                    sx={{
                      textTransform: "none",
                      "&.Mui-selected": {
                        color: "white",
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                      },
                    }}
                  >
                    {tag}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitDiscussion}
            disabled={
              !discussionForm.title ||
              !discussionForm.description ||
              discussionForm.tags.length === 0
            }
          >
            Post Discussion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserDashboard;
