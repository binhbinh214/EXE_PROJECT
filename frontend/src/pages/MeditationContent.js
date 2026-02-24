import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Pagination,
} from "@mui/material";
import {
  Search,
  PlayArrow,
  AccessTime,
  Visibility,
  Clear,
} from "@mui/icons-material";
import { getContents, getFeaturedContents } from "../store/slices/contentSlice";

const categories = [
  { value: "all", label: "Tất cả" },
  { value: "stress", label: "Giảm stress" },
  { value: "anxiety", label: "Lo âu" },
  { value: "sleep", label: "Giấc ngủ" },
  { value: "mindfulness", label: "Chánh niệm" },
  { value: "focus", label: "Tập trung" },
];

// Debounce delay in milliseconds
const SEARCH_DEBOUNCE_DELAY = 500;

const MeditationContent = () => {
  const dispatch = useDispatch();
  const { contents, featuredContents, isLoading, pagination } = useSelector(
    (state) => state.content
  );

  const [category, setCategory] = useState("all");
  const [searchInput, setSearchInput] = useState(""); // Input value (what user types)
  const [searchQuery, setSearchQuery] = useState(""); // Actual search query (debounced)
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Ref to store debounce timer
  const debounceTimerRef = useRef(null);

  // Fetch featured contents on mount
  useEffect(() => {
    dispatch(getFeaturedContents());
  }, [dispatch]);

  // Fetch contents when search query, category, or page changes
  useEffect(() => {
    const params = { page, limit: 12 };
    if (category !== "all") params.category = category;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    dispatch(getContents(params));
  }, [dispatch, page, category, searchQuery]);

  // Debounced search handler
  const debouncedSearch = useCallback((value) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedValue = value.trim();

    // If empty, immediately clear search
    if (!trimmedValue) {
      setSearchQuery("");
      setIsSearching(false);
      setPage(1);
      return;
    }

    // Show searching indicator
    setIsSearching(true);

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(trimmedValue);
      setPage(1);
      setIsSearching(false);
    }, SEARCH_DEBOUNCE_DELAY);
  }, []);

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
    setPage(1);
  };

  // Handle form submit (Enter key)
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    // Clear debounce timer and search immediately
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedValue = searchInput.trim();
    setSearchQuery(trimmedValue);
    setIsSearching(false);
    setPage(1);
  };

  // Handle category change
  const handleCategoryChange = (e, newValue) => {
    setCategory(newValue);
    setPage(1);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    return `${mins} phút`;
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "meditation":
        return "Thiền định";
      case "breathing":
        return "Bài thở";
      case "relaxation":
        return "Thư giãn";
      case "exercise":
        return "Bài tập";
      case "article":
        return "Bài viết";
      default:
        return type;
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
          color: "white",
          py: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Thiền & Thư giãn
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Khám phá các bài thiền, bài tập thở và nội dung thư giãn
          </Typography>
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ maxWidth: 500 }}
          >
            <TextField
              fullWidth
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Tìm kiếm nội dung..."
              autoComplete="off"
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { border: "none" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Search color="action" />
                    )}
                  </InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                      aria-label="Xóa tìm kiếm"
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {/* Show search result info */}
          {searchQuery && (
            <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
              Kết quả tìm kiếm cho: "<strong>{searchQuery}</strong>"
              {!isLoading && ` (${pagination.total || 0} kết quả)`}
            </Typography>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Featured Content - Hide when searching */}
        {!searchQuery && featuredContents && featuredContents.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Nổi bật
            </Typography>
            <Grid container spacing={3}>
              {featuredContents.slice(0, 4).map((content) => (
                <Grid item xs={12} sm={6} md={3} key={content._id}>
                  <Card
                    component={Link}
                    to={`/content/${content._id}`}
                    sx={{
                      textDecoration: "none",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-8px)" },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={
                          content.thumbnailUrl ||
                          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400"
                        }
                        alt={content.title}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: "rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.3s",
                          "&:hover": { opacity: 1 },
                        }}
                      >
                        <PlayArrow sx={{ fontSize: 60, color: "white" }} />
                      </Box>
                      {content.duration && (
                        <Chip
                          label={formatDuration(content.duration)}
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            bgcolor: "rgba(0,0,0,0.7)",
                            color: "white",
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flex: 1 }}>
                      <Chip
                        label={getTypeLabel(content.type)}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {content.title}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <Visibility fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {content.views?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Category Tabs */}
        <Tabs
          value={category}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          {categories.map((cat) => (
            <Tab key={cat.value} value={cat.value} label={cat.label} />
          ))}
        </Tabs>

        {/* Content Grid */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : contents.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery
                ? `Không tìm thấy kết quả cho "${searchQuery}"`
                : "Không tìm thấy nội dung nào"}
            </Typography>
            {searchQuery && (
              <Typography variant="body2" color="text.secondary">
                Hãy thử tìm kiếm với từ khóa khác hoặc{" "}
                <Box
                  component="span"
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={handleClearSearch}
                >
                  xóa bộ lọc
                </Box>
              </Typography>
            )}
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {contents.map((content) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={content._id}>
                  <Card
                    component={Link}
                    to={`/content/${content._id}`}
                    sx={{
                      textDecoration: "none",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={
                          content.thumbnailUrl ||
                          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400"
                        }
                        alt={content.title}
                      />
                      {content.duration && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            bgcolor: "rgba(0,0,0,0.7)",
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <AccessTime fontSize="small" sx={{ fontSize: 14 }} />
                          {formatDuration(content.duration)}
                        </Box>
                      )}
                    </Box>
                    <CardContent sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          mb: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={getTypeLabel(content.type)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={content.difficulty || "beginner"}
                          size="small"
                          color={
                            content.difficulty === "advanced"
                              ? "error"
                              : content.difficulty === "intermediate"
                              ? "warning"
                              : "success"
                          }
                        />
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        {content.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {content.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {pagination.pages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={pagination.pages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default MeditationContent;
