import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Rating,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  PlayCircle,
  CheckCircle,
  Visibility,
  AccessTime,
} from "@mui/icons-material";
import contentService from "../services/content.service";

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentService.getContentById(id);

      if (response.data && response.data.success) {
        setContent(response.data.data);
      } else {
        setError("Không thể tải nội dung");
      }
    } catch (err) {
      console.error("Error fetching content:", err);
      setError(err.response?.data?.message || "Lỗi khi tải nội dung");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await contentService.likeContent(id);
      setLiked(!liked);
      setContent((prev) => ({
        ...prev,
        likes: liked ? (prev.likes || 0) - 1 : (prev.likes || 0) + 1,
      }));
    } catch (err) {
      console.error("Error liking content:", err);
    }
  };

  const handleRate = async (newValue) => {
    try {
      await contentService.rateContent(id, newValue);
      setUserRating(newValue);
      fetchContent();
    } catch (err) {
      console.error("Error rating content:", err);
    }
  };

  const handleComplete = async () => {
    try {
      await contentService.recordCompletion(id);
      setCompleted(true);
      setContent((prev) => ({
        ...prev,
        completions: (prev.completions || 0) + 1,
      }));
    } catch (err) {
      console.error("Error recording completion:", err);
    }
  };

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";

    // Nếu đã là embed URL
    if (url.includes("/embed/")) return url;

    // Xử lý youtube.com/watch?v=
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Xử lý youtu.be/
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  };

  const getMediaUrl = (url) => {
    if (!url) return "";

    // Nếu là YouTube URL, trả về embed URL
    if (isYouTubeUrl(url)) {
      return getYouTubeEmbedUrl(url);
    }

    // Nếu đã là URL đầy đủ
    if (url.startsWith("http")) return url;

    // Nếu là file upload từ server
    const baseUrl =
      process.env.REACT_APP_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? url : "/" + url}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      meditation: "primary",
      exercise: "success",
      education: "info",
      therapy: "secondary",
      music: "warning",
    };
    return colors[category] || "default";
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: "success",
      intermediate: "warning",
      advanced: "error",
    };
    return colors[difficulty] || "default";
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải nội dung...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/content")}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  if (!content) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Không tìm thấy nội dung
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/content")}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/content")}
        sx={{ mb: 3 }}
      >
        Quay lại
      </Button>

      {/* Main Content Card */}
      <Card elevation={3}>
        {/* Video/Audio Player */}
        {content.mediaType === "video" && content.mediaUrl && (
          <Box
            sx={{
              position: "relative",
              paddingTop: "56.25%", // 16:9 Aspect Ratio
              backgroundColor: "#000",
            }}
          >
            {isYouTubeUrl(content.mediaUrl) ? (
              // YouTube iframe
              <iframe
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                src={getMediaUrl(content.mediaUrl)}
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              // HTML5 Video player cho file upload
              <video
                controls
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                onError={(e) => {
                  console.error("Video load error:", e);
                  console.error("Video URL:", getMediaUrl(content.mediaUrl));
                }}
              >
                <source src={getMediaUrl(content.mediaUrl)} type="video/mp4" />
                <source src={getMediaUrl(content.mediaUrl)} type="video/webm" />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            )}
          </Box>
        )}

        {content.mediaType === "audio" && content.mediaUrl && (
          <Box sx={{ p: 3, backgroundColor: "#f5f5f5" }}>
            <audio
              controls
              style={{ width: "100%", height: "54px" }}
              onError={(e) => {
                console.error("Audio load error:", e);
              }}
            >
              <source src={getMediaUrl(content.mediaUrl)} type="audio/mpeg" />
              <source src={getMediaUrl(content.mediaUrl)} type="audio/ogg" />
              Trình duyệt của bạn không hỗ trợ audio.
            </audio>
          </Box>
        )}

        {/* Article Content for non-media types */}
        {content.mediaType === "article" && (
          <Box
            sx={{
              p: 4,
              minHeight: "300px",
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {content.description}
            </Typography>
          </Box>
        )}

        {/* Content Info */}
        <CardContent sx={{ p: 4 }}>
          {/* Title and Meta */}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            {content.title}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
            <Chip
              label={content.category}
              color={getCategoryColor(content.category)}
              size="small"
            />
            <Chip label={content.type} variant="outlined" size="small" />
            <Chip
              label={content.difficulty}
              color={getDifficultyColor(content.difficulty)}
              size="small"
            />
            {content.duration && (
              <Chip
                icon={<AccessTime />}
                label={`${content.duration} phút`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                }}
              >
                <Visibility color="action" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold">
                  {content.views || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lượt xem
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "#ffebee",
                  borderRadius: 2,
                }}
              >
                <Favorite color="error" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold">
                  {content.likes || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lượt thích
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "#e8f5e9",
                  borderRadius: 2,
                }}
              >
                <CheckCircle color="success" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold">
                  {content.completions || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hoàn thành
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Description */}
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Mô tả
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ lineHeight: 1.8, color: "text.secondary" }}
          >
            {content.description}
          </Typography>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Thẻ
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {content.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              backgroundColor: "#fafafa",
              p: 3,
              borderRadius: 2,
            }}
          >
            {/* Like Button */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={handleLike}
                color={liked ? "error" : "default"}
                size="large"
                sx={{
                  transition: "all 0.3s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              >
                {liked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <Typography variant="body2" fontWeight="medium">
                {liked ? "Đã thích" : "Thích"}
              </Typography>
            </Box>

            {/* Rating */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                Đánh giá:
              </Typography>
              <Rating
                value={userRating}
                onChange={(event, newValue) => handleRate(newValue)}
                size="large"
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#ff6d75",
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                ({content.rating?.average?.toFixed(1) || 0}/5 -{" "}
                {content.rating?.count || 0} đánh giá)
              </Typography>
            </Box>

            {/* Complete Button */}
            <Button
              variant="contained"
              color={completed ? "success" : "primary"}
              startIcon={completed ? <CheckCircle /> : <PlayCircle />}
              onClick={handleComplete}
              disabled={completed}
              size="large"
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "bold",
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s",
              }}
            >
              {completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Author Info */}
      {content.createdBy && (
        <Card elevation={1} sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            👤 Người tạo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {content.createdBy.name || "Ẩn danh"}
          </Typography>
          {content.createdBy.role && (
            <Chip
              label={content.createdBy.role}
              size="small"
              color="primary"
              sx={{ mt: 1 }}
            />
          )}
        </Card>
      )}
    </Container>
  );
};

export default ContentDetail;
