import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  TextField,
  IconButton,
  Badge,
  InputAdornment,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Send,
  AttachFile,
  Search,
  MoreVert,
  VideoCall,
  Phone,
  EmojiEmotions,
  Image as ImageIcon,
  InsertDriveFile,
  Close,
  Check,
  DoneAll,
  Info,
} from "@mui/icons-material";
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";
import messageService from "../../services/message.service";
import socket from "../../services/socket.service";

const Messages = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const initialOtherUser = location.state?.otherUser;
  const theme = useTheme();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentConversationRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Update ref when conversation changes
  useEffect(() => {
    currentConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    fetchConversations();
    setupSocketListeners();

    if (initialOtherUser) {
      const ids = [user._id, initialOtherUser._id].sort();
      const conversationId = `${ids[0]}_${ids[1]}`;

      const tempConversation = {
        conversationId,
        otherUser: initialOtherUser,
        lastMessage: {
          content: "Bắt đầu cuộc trò chuyện...",
          createdAt: new Date(),
          isMine: false,
        },
        unreadCount: 0,
      };
      fetchMessages(tempConversation);
    }

    return () => {
      socket.off("new_message");
      socket.off("message_notification");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("message_read");
      socket.off("message_delivered");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocketListeners = () => {
    console.log("🔧 Setting up socket listeners...");

    socket.on("new_message", (message) => {
      console.log("📩 New message received:", message);
      const currentConv = currentConversationRef.current;

      if (
        currentConv &&
        message.conversationId === currentConv.conversationId
      ) {
        console.log("✅ Message for current conversation");

        setMessages((prev) => {
          const exists = prev.some((m) => {
            if (m._id === message._id) return true;
            if (
              m.sender._id === message.sender._id &&
              m.content === message.content &&
              Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) <
                5000
            ) {
              return true;
            }
            return false;
          });

          if (exists) {
            console.log("⚠️ Message already exists, skipping");
            return prev;
          }

          console.log("➕ Adding new message to UI");
          return [...prev, message];
        });

        if (message.receiver._id === user._id) {
          console.log("📖 Marking message as read");
          socket.emit("mark_read", { messageId: message._id });
        }
      } else {
        console.log("ℹ️ Message not for current conversation");
      }

      fetchConversations();
    });

    socket.on("user_typing", (data) => {
      const currentConv = currentConversationRef.current;
      if (currentConv && data.userId === currentConv.otherUser._id) {
        setIsTyping(true);
      }
    });

    socket.on("user_stop_typing", (data) => {
      const currentConv = currentConversationRef.current;
      if (currentConv && data.userId === currentConv.otherUser._id) {
        setIsTyping(false);
      }
    });

    socket.on("message_read", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
    });

    socket.on("message_delivered", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, isDelivered: true, deliveredAt: data.deliveredAt }
            : msg
        )
      );
    });

    socket.on("message_notification", (data) => {
      fetchConversations();
    });
  };

  const fetchConversations = async () => {
    try {
      const response = await messageService.getConversations();
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      if (error.response?.status !== 404) {
        toast.error("Không thể tải danh sách cuộc trò chuyện");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversation) => {
    try {
      setSelectedConversation(conversation);

      const response = await messageService.getConversation(
        conversation.otherUser._id
      );
      if (response.data.success) {
        setMessages(response.data.data);
        await messageService.markAsRead(conversation.otherUser._id);
        socket.emit("join_conversation", conversation.conversationId);
        fetchConversations();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 404) {
        setMessages([]);
        const ids = [user._id, conversation.otherUser._id].sort();
        const conversationId = `${ids[0]}_${ids[1]}`;
        socket.emit("join_conversation", conversationId);
      } else {
        toast.error("Không thể tải tin nhắn");
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    const tempMessage = {
      _id: tempId,
      sender: {
        _id: user._id,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      receiver: {
        _id: selectedConversation.otherUser._id,
        fullName: selectedConversation.otherUser.fullName,
        avatar: selectedConversation.otherUser.avatar,
      },
      content: messageContent,
      type: "text",
      createdAt: new Date(),
      isDelivered: true,
      isRead: false,
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      setSendingMessage(true);

      const messageData = {
        receiverId: selectedConversation.otherUser._id,
        content: messageContent,
        type: "text",
      };

      socket.emit("send_message", messageData, (response) => {
        if (response?.success) {
          setMessages((prev) => {
            const filtered = prev.filter((msg) => msg._id !== tempId);
            const exists = filtered.some((m) => m._id === response.data._id);
            if (exists) return filtered;
            return [...filtered, response.data];
          });
          fetchConversations();
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === tempId
                ? { ...msg, sendFailed: true, isDelivered: false }
                : msg
            )
          );
          toast.error(response?.message || "Không thể gửi tin nhắn");
        }
      });

      socket.emit("typing_stop", {
        receiverId: selectedConversation.otherUser._id,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId
            ? { ...msg, sendFailed: true, isDelivered: false }
            : msg
        )
      );
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!selectedConversation) return;

    socket.emit("typing_start", {
      receiverId: selectedConversation.otherUser._id,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", {
        receiverId: selectedConversation.otherUser._id,
      });
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
      return format(messageDate, "HH:mm", { locale: vi });
    } else if (isYesterday(messageDate)) {
      return `Hôm qua ${format(messageDate, "HH:mm", { locale: vi })}`;
    } else if (isThisWeek(messageDate)) {
      return format(messageDate, "EEEE HH:mm", { locale: vi });
    } else {
      return format(messageDate, "dd/MM/yyyy HH:mm", { locale: vi });
    }
  };

  const formatLastMessageTime = (date) => {
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
      return format(messageDate, "HH:mm", { locale: vi });
    } else if (isYesterday(messageDate)) {
      return "Hôm qua";
    } else if (isThisWeek(messageDate)) {
      return format(messageDate, "EEEE", { locale: vi });
    } else {
      return format(messageDate, "dd/MM/yyyy", { locale: vi });
    }
  };

  const getMessageStatusIcon = (message) => {
    if (message.sendFailed) {
      return <Close sx={{ fontSize: 14, color: "error.main" }} />;
    }
    if (message.isRead) {
      return <DoneAll sx={{ fontSize: 14, color: "info.main" }} />;
    }
    if (message.isDelivered) {
      return <DoneAll sx={{ fontSize: 14 }} />;
    }
    return <Check sx={{ fontSize: 14 }} />;
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{ height: "100vh", display: "flex", flexDirection: "column", pb: 2 }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Tin nhắn
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {conversations.length} cuộc trò chuyện
        </Typography>
      </Box>

      {/* Main Chat Container */}
      <Card
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          boxShadow: theme.shadows[4],
          borderRadius: 2,
        }}
      >
        <Grid container sx={{ height: "100%" }}>
          {/* Conversations Sidebar */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              borderRight: { md: 1 },
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Search Box */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              />
            </Box>

            {/* Conversations List */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: alpha(theme.palette.primary.main, 0.05),
                },
                "&::-webkit-scrollbar-thumb": {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: "4px",
                  "&:hover": {
                    background: alpha(theme.palette.primary.main, 0.5),
                  },
                },
              }}
            >
              {filteredConversations.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography color="text.secondary" variant="body2">
                    Chưa có cuộc trò chuyện nào
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {filteredConversations.map((conv) => (
                    <ListItemButton
                      key={conv.conversationId}
                      selected={
                        selectedConversation?.conversationId ===
                        conv.conversationId
                      }
                      onClick={() => fetchMessages(conv)}
                      sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        py: 2,
                        px: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08
                          ),
                        },
                        "&.Mui-selected": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.12
                          ),
                          borderLeft: 3,
                          borderLeftColor: "primary.main",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.15
                            ),
                          },
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conv.unreadCount}
                          color="error"
                          overlap="circular"
                          sx={{
                            "& .MuiBadge-badge": {
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            },
                          }}
                        >
                          <Avatar
                            src={conv.otherUser.avatar}
                            sx={{
                              width: 48,
                              height: 48,
                              border: 2,
                              borderColor:
                                conv.unreadCount > 0
                                  ? "primary.main"
                                  : "transparent",
                            }}
                          >
                            {conv.otherUser.fullName?.charAt(0)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight={conv.unreadCount > 0 ? 700 : 600}
                              noWrap
                              sx={{ flex: 1 }}
                            >
                              {conv.otherUser.fullName}
                            </Typography>
                            {conv.otherUser.role !== "customer" && (
                              <Chip
                                label={
                                  conv.otherUser.role === "doctor" ? "BS" : "CG"
                                }
                                size="small"
                                color="primary"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              fontWeight={conv.unreadCount > 0 ? 600 : 400}
                              sx={{ flex: 1 }}
                            >
                              {conv.lastMessage.isMine && "Bạn: "}
                              {conv.lastMessage.content}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ textAlign: "right", ml: 1 }}>
                        <Typography
                          variant="caption"
                          color={
                            conv.unreadCount > 0
                              ? "primary.main"
                              : "text.secondary"
                          }
                          fontWeight={conv.unreadCount > 0 ? 600 : 400}
                        >
                          {formatLastMessageTime(conv.lastMessage.createdAt)}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>
          </Grid>

          {/* Chat Area */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={selectedConversation.otherUser.avatar}
                        sx={{
                          width: 48,
                          height: 48,
                          border: 2,
                          borderColor: "primary.main",
                        }}
                      >
                        {selectedConversation.otherUser.fullName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {selectedConversation.otherUser.fullName}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={
                              selectedConversation.otherUser.role === "doctor"
                                ? "Bác sĩ"
                                : selectedConversation.otherUser.role ===
                                  "healer"
                                ? "Chuyên gia tâm lý"
                                : "Người dùng"
                            }
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Gọi điện thoại">
                        <IconButton size="small" color="primary">
                          <Phone />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Video call">
                        <IconButton size="small" color="primary">
                          <VideoCall />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Thông tin">
                        <IconButton size="small" color="primary">
                          <Info />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                      >
                        <MenuItem onClick={() => setAnchorEl(null)}>
                          Xóa cuộc trò chuyện
                        </MenuItem>
                        <MenuItem onClick={() => setAnchorEl(null)}>
                          Chặn người dùng
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                </Box>

                {/* Messages Container - TỰ ĐỘNG CUỘN */}
                <Box
                  ref={messagesContainerRef}
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 2,
                    backgroundColor: alpha(
                      theme.palette.background.default,
                      0.5
                    ),
                    backgroundImage: `linear-gradient(${alpha(
                      theme.palette.primary.main,
                      0.02
                    )} 1px, transparent 1px), linear-gradient(90deg, ${alpha(
                      theme.palette.primary.main,
                      0.02
                    )} 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                    // ← QUAN TRỌNG: CÁC STYLE ĐỂ TỰ ĐỘNG CUỘN
                    maxHeight: "calc(100vh - 300px)",
                    minHeight: "400px",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: alpha(theme.palette.primary.main, 0.05),
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: alpha(theme.palette.primary.main, 0.3),
                      borderRadius: "4px",
                      "&:hover": {
                        background: alpha(theme.palette.primary.main, 0.5),
                      },
                    },
                  }}
                >
                  {messages.length === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            mx: "auto",
                            mb: 2,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                            color: "primary.main",
                          }}
                        >
                          <EmojiEmotions sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          gutterBottom
                        >
                          Chưa có tin nhắn nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Hãy bắt đầu cuộc trò chuyện!
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        const isMine = message.sender._id === user._id;
                        const showAvatar =
                          index === 0 ||
                          messages[index - 1].sender._id !== message.sender._id;
                        const showTimestamp =
                          index === 0 ||
                          new Date(message.createdAt).getTime() -
                            new Date(messages[index - 1].createdAt).getTime() >
                            300000; // 5 minutes

                        return (
                          <React.Fragment key={message._id}>
                            {showTimestamp && (
                              <Box sx={{ textAlign: "center", my: 2 }}>
                                <Chip
                                  label={formatMessageTime(message.createdAt)}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(
                                      theme.palette.background.paper,
                                      0.8
                                    ),
                                    fontSize: "0.7rem",
                                  }}
                                />
                              </Box>
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: isMine
                                  ? "flex-end"
                                  : "flex-start",
                                mb: showAvatar ? 2 : 0.5,
                                alignItems: "flex-end",
                                opacity: 1,
                              }}
                            >
                              {!isMine && showAvatar && (
                                <Avatar
                                  src={message.sender.avatar}
                                  sx={{ width: 32, height: 32, mr: 1 }}
                                >
                                  {message.sender.fullName?.charAt(0)}
                                </Avatar>
                              )}
                              {!isMine && !showAvatar && (
                                <Box sx={{ width: 40 }} />
                              )}

                              <Paper
                                elevation={1}
                                sx={{
                                  p: 1.5,
                                  maxWidth: "70%",
                                  backgroundColor: isMine
                                    ? "primary.main"
                                    : "background.paper",
                                  color: isMine
                                    ? "primary.contrastText"
                                    : "text.primary",
                                  borderRadius: isMine
                                    ? "16px 16px 4px 16px"
                                    : "16px 16px 16px 4px",
                                  border: message.sendFailed
                                    ? "1px solid"
                                    : "none",
                                  borderColor: "error.main",
                                  position: "relative",
                                  boxShadow: isMine
                                    ? theme.shadows[2]
                                    : theme.shadows[1],
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    boxShadow: theme.shadows[4],
                                  },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    wordBreak: "break-word",
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {message.content}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mt: 0.5,
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      opacity: 0.8,
                                      fontSize: "0.65rem",
                                    }}
                                  >
                                    {format(
                                      new Date(message.createdAt),
                                      "HH:mm",
                                      {
                                        locale: vi,
                                      }
                                    )}
                                  </Typography>
                                  {isMine && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        opacity: 0.8,
                                      }}
                                    >
                                      {getMessageStatusIcon(message)}
                                    </Box>
                                  )}
                                </Box>
                              </Paper>
                            </Box>
                          </React.Fragment>
                        );
                      })}

                      {isTyping && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            ml: 5,
                            mb: 2,
                          }}
                        >
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1.5,
                              borderRadius: "16px 16px 16px 4px",
                              backgroundColor: "background.paper",
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              {[0, 1, 2].map((i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: "text.secondary",
                                    animation:
                                      "bounce 1.4s infinite ease-in-out",
                                    animationDelay: `${i * 0.16}s`,
                                    "@keyframes bounce": {
                                      "0%, 80%, 100%": {
                                        transform: "scale(0)",
                                        opacity: 0.5,
                                      },
                                      "40%": {
                                        transform: "scale(1)",
                                        opacity: 1,
                                      },
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          </Paper>
                        </Box>
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>

                {/* Message Input */}
                <Box
                  component="form"
                  onSubmit={handleSendMessage}
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                    <Tooltip title="Đính kèm file">
                      <IconButton
                        size="small"
                        sx={{
                          mb: 0.5,
                          color: "text.secondary",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        <AttachFile />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Gửi hình ảnh">
                      <IconButton
                        size="small"
                        sx={{
                          mb: 0.5,
                          color: "text.secondary",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        <ImageIcon />
                      </IconButton>
                    </Tooltip>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={handleTyping}
                      disabled={sendingMessage}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08
                            ),
                          },
                          "&.Mui-focused": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        },
                      }}
                    />
                    <Tooltip title="Emoji">
                      <IconButton
                        size="small"
                        sx={{
                          mb: 0.5,
                          color: "text.secondary",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        <EmojiEmotions />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Gửi tin nhắn">
                      <span>
                        <IconButton
                          type="submit"
                          color="primary"
                          disabled={!newMessage.trim() || sendingMessage}
                          sx={{
                            mb: 0.5,
                            backgroundColor: "primary.main",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "primary.dark",
                            },
                            "&.Mui-disabled": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.3
                              ),
                            },
                          }}
                        >
                          {sendingMessage ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            <Send />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 3,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                    }}
                  >
                    <EmojiEmotions sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Chọn một cuộc trò chuyện
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chọn cuộc trò chuyện bên trái để bắt đầu nhắn tin
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default Messages;
