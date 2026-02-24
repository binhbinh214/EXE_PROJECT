const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for mental health chatbot
const SYSTEM_PROMPT = `Bạn là một trợ lý AI chuyên về sức khỏe tâm thần tại Mental Healthcare. 
Nhiệm vụ của bạn là:
1. Lắng nghe và đồng cảm với người dùng
2. Cung cấp hỗ trợ cảm xúc và lời khuyên hữu ích
3. Gợi ý các bài tập thư giãn, thiền định khi phù hợp
4. Khuyến khích người dùng tìm kiếm sự giúp đỡ chuyên nghiệp khi cần
5. KHÔNG đưa ra chẩn đoán y khoa hoặc kê đơn thuốc

Hãy trả lời bằng tiếng Việt, thân thiện và ấm áp. 
Nếu phát hiện dấu hiệu khủng hoảng hoặc ý định tự hại, hãy khuyến khích người dùng liên hệ đường dây nóng hỗ trợ sức khỏe tâm thần hoặc gặp chuyên gia ngay lập tức.`;

// Conversation history storage (in production, use Redis or database)
const conversationHistory = new Map();

// @desc    Chat with AI
// @route   POST /api/chatbot/chat
// @access  Private
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Tin nhắn không được để trống",
      });
    }

    // Get or initialize conversation history
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }

    const history = conversationHistory.get(userId);

    // Add user message to history
    history.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Keep only last 10 messages to manage context length
    const recentHistory = history.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Check if OpenAI API key is configured properly
    const apiKey = process.env.OPENAI_API_KEY;
    const isValidApiKey =
      apiKey && apiKey !== "your_openai_api_key" && apiKey.length > 20;

    if (!isValidApiKey) {
      // Fallback response when API key is not configured
      console.log("⚠️ OpenAI API key not configured, using fallback responses");
      const fallbackResponse = getFallbackResponse(message);

      history.push({
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      });

      conversationHistory.set(userId, history);

      return res.status(200).json({
        success: true,
        data: {
          response: fallbackResponse,
          timestamp: new Date(),
          fallback: true,
        },
      });
    }

    // Try calling OpenAI API
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentHistory,
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantResponse = completion.choices[0].message.content;

      // Add assistant response to history
      history.push({
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      });

      // Update conversation history
      conversationHistory.set(userId, history);

      return res.status(200).json({
        success: true,
        data: {
          response: assistantResponse,
          timestamp: new Date(),
        },
      });
    } catch (openaiError) {
      console.error("❌ OpenAI API error:", openaiError.message);
      console.error("Error code:", openaiError.code);
      console.error("Error status:", openaiError.status);

      // Use fallback response for any OpenAI error
      const fallbackResponse = getFallbackResponse(message);

      history.push({
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      });

      conversationHistory.set(userId, history);

      // Return 200 with fallback response instead of error
      return res.status(200).json({
        success: true,
        data: {
          response: fallbackResponse,
          timestamp: new Date(),
          fallback: true,
          reason: getErrorReason(openaiError),
        },
      });
    }
  } catch (error) {
    console.error("❌ Chatbot server error:", error);

    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Clear conversation history
// @route   DELETE /api/chatbot/history
// @access  Private
exports.clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    conversationHistory.delete(userId);

    res.status(200).json({
      success: true,
      message: "Đã xóa lịch sử trò chuyện",
    });
  } catch (error) {
    console.error("❌ Clear history error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get conversation history
// @route   GET /api/chatbot/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = conversationHistory.get(userId) || [];

    res.status(200).json({
      success: true,
      data: history.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    });
  } catch (error) {
    console.error("❌ Get history error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Helper function to get error reason
function getErrorReason(error) {
  if (error.code === "insufficient_quota") {
    return "API quota exceeded";
  }
  if (error.code === "invalid_api_key") {
    return "Invalid API key";
  }
  if (error.status === 429) {
    return "Rate limit exceeded";
  }
  if (error.status === 503) {
    return "Service temporarily unavailable";
  }
  return "API error";
}

// Fallback responses when API is not configured or has errors
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase().trim();

  // Crisis detection - highest priority
  if (containsCrisisKeywords(lowerMessage)) {
    return `🚨 Tôi nhận thấy bạn có thể đang trải qua giai đoạn rất khó khăn. 

**Xin hãy liên hệ ngay:**
📞 Đường dây nóng hỗ trợ tâm lý: **1800 599 920** (miễn phí, 24/7)
📞 Tổng đài sức khỏe tâm thần: **1900 0027**

Bạn không đơn độc. Có những người sẵn sàng lắng nghe và giúp đỡ bạn.

Nếu bạn đang trong tình trạng khẩn cấp, xin hãy đến cơ sở y tế gần nhất hoặc gọi **115**.

💚 Tôi ở đây nếu bạn cần nói chuyện.`;
  }

  // Greeting
  if (containsGreeting(lowerMessage)) {
    return `Xin chào! 👋 Tôi là trợ lý AI của Mental Healthcare. Tôi ở đây để lắng nghe và hỗ trợ bạn.

Bạn có thể chia sẻ với tôi về:
• 😊 Cảm xúc hiện tại của bạn
• 😰 Những điều khiến bạn lo lắng
• 😴 Các vấn đề về giấc ngủ
• 💭 Hoặc bất cứ điều gì bạn muốn tâm sự

Hôm nay bạn cảm thấy thế nào?`;
  }

  // Stress/anxiety related
  if (containsStressKeywords(lowerMessage)) {
    return `Tôi hiểu bạn đang cảm thấy căng thẳng. Đây là điều rất phổ biến và bạn không đơn độc. 💙

**Một số gợi ý có thể giúp bạn:**

1. 🧘 **Bài tập thở 4-7-8:**
   - Hít vào bằng mũi trong 4 giây
   - Giữ hơi trong 7 giây  
   - Thở ra từ từ trong 8 giây
   - Lặp lại 3-4 lần

2. 🚶 **Đi dạo nhẹ nhàng** 10-15 phút ngoài trời

3. 🎵 **Nghe nhạc thư giãn** hoặc âm thanh thiên nhiên

4. 📝 **Viết nhật ký cảm xúc** để giải tỏa suy nghĩ

Bạn có muốn tôi hướng dẫn chi tiết một bài tập thư giãn không?`;
  }

  // Sadness/depression related
  if (containsSadnessKeywords(lowerMessage)) {
    return `Cảm ơn bạn đã tin tưởng chia sẻ. 💚 Cảm giác buồn là điều hoàn toàn bình thường và bạn có quyền được cảm thấy như vậy.

**Một số điều có thể giúp bạn:**

1. 💬 **Nói chuyện** với người thân hoặc bạn bè tin tưởng

2. 🌞 **Ra ngoài đón ánh nắng** - ánh sáng tự nhiên giúp cải thiện tâm trạng

3. 🏃 **Vận động nhẹ nhàng** - đi bộ, yoga, hoặc căng duỗi cơ

4. 📖 **Thử các bài thiền** trong phần Meditation của ứng dụng

5. 📓 **Viết ra 3 điều tích cực** trong ngày, dù nhỏ nhất

Nếu cảm giác buồn kéo dài hơn 2 tuần, bạn nên cân nhắc đặt lịch với chuyên gia tâm lý. Bạn có cần tôi giúp đặt lịch không?`;
  }

  // Sleep related
  if (containsSleepKeywords(lowerMessage)) {
    return `Giấc ngủ đóng vai trò rất quan trọng cho sức khỏe tinh thần. 🌙

**Mẹo cải thiện giấc ngủ:**

1. ⏰ **Đi ngủ và thức dậy cùng giờ** mỗi ngày, kể cả cuối tuần

2. 📱 **Tắt thiết bị điện tử** ít nhất 1 giờ trước khi ngủ

3. ☕ **Tránh caffeine** sau 2 giờ chiều

4. 🛁 **Tạo thói quen thư giãn** trước khi ngủ: tắm ấm, đọc sách

5. 🌡️ **Giữ phòng ngủ mát mẻ**, tối và yên tĩnh

6. 🧘 **Thử bài tập thư giãn cơ thể** khi nằm trên giường

Bạn có thể thử các bài **Thiền ngủ** trong phần Meditation & Relaxation của ứng dụng. Bạn muốn tôi gợi ý bài tập cụ thể không?`;
  }

  // Anger related
  if (containsAngerKeywords(lowerMessage)) {
    return `Tôi hiểu bạn đang cảm thấy tức giận. Đây là cảm xúc tự nhiên và việc nhận ra nó là bước đầu tiên tốt. 🔥➡️💙

**Một số cách xử lý cơn giận:**

1. 🧊 **Tạm dừng và hít thở sâu** - đếm từ 1 đến 10 trước khi phản ứng

2. 🚶 **Rời khỏi tình huống** nếu có thể, đi dạo để bình tĩnh

3. 💪 **Vận động thể chất** - chạy bộ, đấm gối, hoặc tập thể dục

4. 📝 **Viết ra cảm xúc** thay vì nói ra ngay

5. 🧊 **Rửa mặt bằng nước lạnh** để hạ nhiệt cơ thể

Sau khi bình tĩnh hơn, bạn có thể suy nghĩ về nguyên nhân và cách giải quyết. Bạn có muốn chia sẻ điều gì khiến bạn tức giận không?`;
  }

  // Loneliness related
  if (containsLonelinessKeywords(lowerMessage)) {
    return `Cảm giác cô đơn có thể rất nặng nề. Tôi muốn bạn biết rằng bạn không thực sự một mình. 💙

**Một số gợi ý:**

1. 📞 **Gọi điện cho người thân** - chỉ một cuộc trò chuyện ngắn cũng giúp ích

2. 🤝 **Tham gia cộng đồng** - nhóm sở thích, câu lạc bộ, tình nguyện

3. 🐕 **Tương tác với động vật** nếu có thể

4. 💬 **Trò chuyện với tôi** - tôi luôn sẵn sàng lắng nghe

5. 📱 **Kết nối online** với bạn bè cũ

6. 🧘 **Thử thiền về lòng từ bi** (Loving-kindness meditation)

Bạn có muốn nói thêm về cảm giác của mình không? Tôi ở đây để lắng nghe.`;
  }

  // Work/study stress
  if (containsWorkStudyKeywords(lowerMessage)) {
    return `Áp lực từ công việc/học tập là điều rất phổ biến. Hãy nhớ rằng sức khỏe của bạn quan trọng hơn mọi deadline! 💼📚

**Một số mẹo quản lý áp lực:**

1. 📋 **Chia nhỏ công việc** thành các phần dễ quản lý

2. ⏰ **Kỹ thuật Pomodoro**: Làm 25 phút, nghỉ 5 phút

3. 🎯 **Ưu tiên nhiệm vụ** quan trọng nhất trước

4. 🚫 **Học cách nói "không"** khi quá tải

5. ☕ **Nghỉ ngơi đúng cách** - ra khỏi bàn làm việc khi nghỉ

6. 🏃 **Vận động giữa giờ** - đi bộ, căng duỗi

Bạn đang gặp khó khăn cụ thể nào? Tôi có thể giúp bạn tìm giải pháp.`;
  }

  // Relationship issues
  if (containsRelationshipKeywords(lowerMessage)) {
    return `Các mối quan hệ có thể mang lại nhiều cảm xúc phức tạp. Cảm ơn bạn đã chia sẻ. 💕

**Một số suy nghĩ:**

1. 💬 **Giao tiếp cởi mở** - nói ra cảm xúc của mình một cách bình tĩnh

2. 👂 **Lắng nghe tích cực** - cố gắng hiểu góc nhìn của người khác

3. ⏰ **Cho nhau không gian** khi cần thiết

4. 🎯 **Tập trung vào giải pháp** thay vì đổ lỗi

5. 💚 **Chăm sóc bản thân** - bạn không thể yêu thương người khác nếu không yêu thương chính mình

Nếu vấn đề phức tạp, việc gặp chuyên gia tâm lý hoặc tư vấn cặp đôi có thể hữu ích. Bạn có muốn chia sẻ thêm không?`;
  }

  // Meditation/relaxation request
  if (containsMeditationKeywords(lowerMessage)) {
    return `Tuyệt vời! Thiền định là một công cụ rất hiệu quả cho sức khỏe tinh thần. 🧘‍♀️

**Bài tập thiền đơn giản (5 phút):**

1. 🪑 Ngồi thoải mái, lưng thẳng
2. 👀 Nhắm mắt nhẹ nhàng
3. 🌬️ Chú ý vào hơi thở tự nhiên
4. 💭 Khi tâm trí lang thang, nhẹ nhàng đưa sự chú ý về hơi thở
5. 🔔 Sau 5 phút, từ từ mở mắt

**Các loại thiền bạn có thể thử:**
• 🌊 Thiền quét cơ thể (Body Scan)
• 💚 Thiền lòng từ bi (Loving-kindness)
• 🎧 Thiền có hướng dẫn

Bạn có thể tìm thêm các bài thiền trong phần **Meditation & Relaxation** của ứng dụng!`;
  }

  // Thank you
  if (containsThankKeywords(lowerMessage)) {
    return `Không có gì! 😊 Tôi rất vui được hỗ trợ bạn.

Hãy nhớ rằng:
• 💚 Chăm sóc sức khỏe tinh thần là điều quan trọng
• 🌱 Mỗi bước nhỏ đều có ý nghĩa
• 🤝 Bạn không đơn độc trên hành trình này

Nếu cần bất cứ điều gì, đừng ngần ngại quay lại trò chuyện với tôi nhé!

Chúc bạn một ngày tốt lành! 🌸`;
  }

  // Goodbye
  if (containsGoodbyeKeywords(lowerMessage)) {
    return `Tạm biệt! 👋 Rất vui được trò chuyện với bạn.

Hãy nhớ:
• 💚 Bạn xứng đáng được hạnh phúc
• 🌟 Mỗi ngày là một cơ hội mới
• 🤗 Tôi luôn ở đây khi bạn cần

Chúc bạn mọi điều tốt đẹp! Hẹn gặp lại! 🌈`;
  }

  // Default response
  return `Cảm ơn bạn đã chia sẻ. 💙 Tôi ở đây để lắng nghe bạn.

**Bạn có thể:**
• 💬 Chia sẻ thêm về cảm xúc của mình
• 🧘 Thử các bài tập thiền định trong phần **Meditation**
• 📓 Viết nhật ký cảm xúc để theo dõi tâm trạng
• 👨‍⚕️ Đặt lịch hẹn với chuyên gia nếu cần hỗ trợ chuyên sâu

**Một số chủ đề tôi có thể hỗ trợ:**
• Căng thẳng và lo âu
• Vấn đề về giấc ngủ
• Cảm xúc tiêu cực
• Các bài tập thư giãn

Tôi có thể giúp gì thêm cho bạn?`;
}

// Helper functions to detect keywords
function containsCrisisKeywords(message) {
  const crisisWords = [
    "tự tử",
    "muốn chết",
    "không muốn sống",
    "kết thúc cuộc sống",
    "tự hại",
    "tự làm đau",
    "cắt tay",
    "suicide",
    "kill myself",
    "end my life",
    "want to die",
    "không còn ý nghĩa",
    "chết đi cho rồi",
  ];
  return crisisWords.some((word) => message.includes(word));
}

function containsGreeting(message) {
  const greetings = [
    "xin chào",
    "chào bạn",
    "hello",
    "hi",
    "hey",
    "chào",
    "good morning",
    "good afternoon",
    "good evening",
    "buổi sáng",
    "buổi chiều",
    "buổi tối",
  ];
  return greetings.some((word) => message.includes(word));
}

function containsStressKeywords(message) {
  const stressWords = [
    "stress",
    "căng thẳng",
    "lo lắng",
    "lo âu",
    "anxiety",
    "áp lực",
    "stressed",
    "worried",
    "anxious",
    "bồn chồn",
    "hồi hộp",
    "sợ hãi",
    "hoảng loạn",
    "panic",
  ];
  return stressWords.some((word) => message.includes(word));
}

function containsSadnessKeywords(message) {
  const sadWords = [
    "buồn",
    "trầm cảm",
    "chán",
    "depression",
    "sad",
    "depressed",
    "tuyệt vọng",
    "hopeless",
    "bất hạnh",
    "unhappy",
    "khóc",
    "nước mắt",
    "đau khổ",
    "suffering",
    "mệt mỏi",
    "kiệt sức",
  ];
  return sadWords.some((word) => message.includes(word));
}

function containsSleepKeywords(message) {
  const sleepWords = [
    "ngủ",
    "mất ngủ",
    "insomnia",
    "sleep",
    "không ngủ được",
    "khó ngủ",
    "thức đêm",
    "giấc ngủ",
    "ngủ không ngon",
    "ác mộng",
    "nightmare",
    "mơ",
    "tỉnh giấc",
  ];
  return sleepWords.some((word) => message.includes(word));
}

function containsAngerKeywords(message) {
  const angerWords = [
    "tức giận",
    "giận",
    "angry",
    "anger",
    "bực",
    "bực mình",
    "cáu",
    "irritated",
    "furious",
    "rage",
    "nổi điên",
    "điên tiết",
    "ghét",
    "hate",
    "frustrated",
    "bực bội",
  ];
  return angerWords.some((word) => message.includes(word));
}

function containsLonelinessKeywords(message) {
  const lonelyWords = [
    "cô đơn",
    "lonely",
    "loneliness",
    "một mình",
    "alone",
    "không ai hiểu",
    "cô độc",
    "lẻ loi",
    "bị bỏ rơi",
    "không có ai",
    "isolated",
    "xa cách",
  ];
  return lonelyWords.some((word) => message.includes(word));
}

function containsWorkStudyKeywords(message) {
  const workWords = [
    "công việc",
    "work",
    "job",
    "học",
    "study",
    "deadline",
    "sếp",
    "boss",
    "đồng nghiệp",
    "colleague",
    "thi",
    "exam",
    "bài tập",
    "assignment",
    "project",
    "dự án",
    "overtime",
    "làm thêm giờ",
    "quá tải",
    "overwork",
  ];
  return workWords.some((word) => message.includes(word));
}

function containsRelationshipKeywords(message) {
  const relationshipWords = [
    "chia tay",
    "breakup",
    "người yêu",
    "boyfriend",
    "girlfriend",
    "vợ",
    "chồng",
    "wife",
    "husband",
    "bạn trai",
    "bạn gái",
    "mối quan hệ",
    "relationship",
    "hôn nhân",
    "marriage",
    "gia đình",
    "family",
    "bố mẹ",
    "parents",
    "con cái",
    "cãi nhau",
  ];
  return relationshipWords.some((word) => message.includes(word));
}

function containsMeditationKeywords(message) {
  const meditationWords = [
    "thiền",
    "meditation",
    "meditate",
    "thư giãn",
    "relax",
    "relaxation",
    "thở",
    "breathing",
    "yoga",
    "mindfulness",
    "chánh niệm",
    "bình tĩnh",
    "calm",
  ];
  return meditationWords.some((word) => message.includes(word));
}

function containsThankKeywords(message) {
  const thankWords = [
    "cảm ơn",
    "thank",
    "thanks",
    "cám ơn",
    "biết ơn",
    "grateful",
    "appreciate",
  ];
  return thankWords.some((word) => message.includes(word));
}

function containsGoodbyeKeywords(message) {
  const goodbyeWords = [
    "tạm biệt",
    "goodbye",
    "bye",
    "gặp lại",
    "see you",
    "chào nhé",
    "bye bye",
    "đi đây",
    "ngủ đây",
  ];
  return goodbyeWords.some((word) => message.includes(word));
}
