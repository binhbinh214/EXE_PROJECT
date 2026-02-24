const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User.model');
const Content = require('./models/Content.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental_healthcare');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  // Drop existing collection and indexes
  try {
    await mongoose.connection.db.dropCollection('users');
  } catch (e) {
    // Collection may not exist
  }

  const users = [
    {
      email: 'admin@mentalhealthcare.com',
      password: await bcrypt.hash('admin123', 12),
      fullName: 'Admin',
      role: 'admin',
      status: 'active',
      isVerified: true,
    },
    {
      email: 'doctor@mentalhealthcare.com',
      password: await bcrypt.hash('doctor123', 12),
      fullName: 'BS. Nguyễn Văn A',
      role: 'doctor',
      status: 'active',
      isVerified: true,
      isProfileVerified: true,
      specialization: 'Tâm lý học lâm sàng',
      bio: 'Bác sĩ chuyên khoa tâm thần với hơn 10 năm kinh nghiệm trong điều trị lo âu, trầm cảm và các rối loạn tâm lý.',
      experienceYears: 10,
      consultationFee: 500000,
      rating: 4.8,
      totalRatings: 156,
    },
    {
      email: 'doctor2@mentalhealthcare.com',
      password: await bcrypt.hash('doctor123', 12),
      fullName: 'BS. Phạm Minh Tuấn',
      role: 'doctor',
      status: 'active',
      isVerified: true,
      isProfileVerified: true,
      specialization: 'Tâm thần học',
      bio: 'Bác sĩ tâm thần với chuyên môn sâu về rối loạn lo âu và trầm cảm. Tốt nghiệp Đại học Y Hà Nội.',
      experienceYears: 8,
      consultationFee: 450000,
      rating: 4.7,
      totalRatings: 98,
    },
    {
      email: 'doctor3@mentalhealthcare.com',
      password: await bcrypt.hash('doctor123', 12),
      fullName: 'BS. Lê Thị Hương',
      role: 'doctor',
      status: 'active',
      isVerified: true,
      isProfileVerified: true,
      specialization: 'Tâm lý trẻ em',
      bio: 'Chuyên gia tâm lý trẻ em và thanh thiếu niên, hỗ trợ các vấn đề về phát triển, hành vi và học tập.',
      experienceYears: 12,
      consultationFee: 550000,
      rating: 4.9,
      totalRatings: 203,
    },
    {
      email: 'healer@mentalhealthcare.com',
      password: await bcrypt.hash('healer123', 12),
      fullName: 'Trần Thị B',
      role: 'healer',
      status: 'active',
      isVerified: true,
      isProfileVerified: true,
      specialization: 'Tư vấn tâm lý',
      bio: 'Chuyên gia tư vấn tâm lý với chứng chỉ quốc tế, chuyên hỗ trợ các vấn đề về stress, quan hệ và phát triển bản thân.',
      experienceYears: 5,
      consultationFee: 300000,
      chatRatePerMinute: 5000,
      rating: 4.6,
      totalRatings: 89,
    },
    {
      email: 'healer2@mentalhealthcare.com',
      password: await bcrypt.hash('healer123', 12),
      fullName: 'Nguyễn Thanh Mai',
      role: 'healer',
      status: 'active',
      isVerified: true,
      isProfileVerified: true,
      specialization: 'Life Coach',
      bio: 'Life Coach chuyên nghiệp, hỗ trợ phát triển bản thân, định hướng nghề nghiệp và cân bằng cuộc sống.',
      experienceYears: 7,
      consultationFee: 350000,
      chatRatePerMinute: 6000,
      rating: 4.5,
      totalRatings: 67,
    },
    {
      email: 'user@mentalhealthcare.com',
      password: await bcrypt.hash('user123', 12),
      fullName: 'Lê Văn C',
      role: 'customer',
      status: 'active',
      isVerified: true,
      balance: 1000000,
    },
  ];

  await User.insertMany(users);
  console.log('Users seeded successfully');
};

const seedContent = async () => {
  // Drop existing collection and indexes
  try {
    await mongoose.connection.db.dropCollection('contents');
  } catch (e) {
    // Collection may not exist
  }

  const contents = [
    {
      title: 'Thiền buổi sáng - Khởi đầu ngày mới',
      description: 'Bắt đầu ngày mới với 10 phút thiền định giúp tâm trí trong sáng và tập trung hơn.',
      type: 'meditation',
      category: 'mindfulness',
      mediaType: 'audio',
      mediaUrl: 'https://example.com/meditation1.mp3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      duration: 600,
      difficulty: 'beginner',
      status: 'published',
      publishedAt: new Date(),
      isFeatured: true,
      views: 1234,
      likes: 89,
    },
    {
      title: 'Kỹ thuật thở 4-7-8 giảm stress',
      description: 'Học kỹ thuật thở được các chuyên gia khuyên dùng để giảm căng thẳng và lo âu ngay lập tức.',
      type: 'breathing',
      category: 'stress',
      mediaType: 'video',
      mediaUrl: 'https://example.com/breathing1.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      duration: 300,
      difficulty: 'beginner',
      status: 'published',
      publishedAt: new Date(),
      isFeatured: true,
      views: 856,
      likes: 67,
    },
    {
      title: 'Thư giãn cơ tiến bộ',
      description: 'Bài tập thư giãn cơ từng phần giúp giải tỏa căng thẳng toàn thân.',
      type: 'relaxation',
      category: 'anxiety',
      mediaType: 'audio',
      mediaUrl: 'https://example.com/relaxation1.mp3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400',
      duration: 900,
      difficulty: 'intermediate',
      status: 'published',
      publishedAt: new Date(),
      views: 567,
      likes: 45,
    },
    {
      title: 'Thiền ngủ ngon',
      description: 'Bài thiền hướng dẫn giúp bạn thư giãn và có giấc ngủ sâu hơn.',
      type: 'meditation',
      category: 'sleep',
      mediaType: 'audio',
      mediaUrl: 'https://example.com/sleep1.mp3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
      duration: 1200,
      difficulty: 'beginner',
      status: 'published',
      publishedAt: new Date(),
      isFeatured: true,
      views: 2345,
      likes: 178,
    },
  ];

  await Content.insertMany(contents);
  console.log('Content seeded successfully');
};

const seed = async () => {
  await connectDB();
  
  try {
    await seedUsers();
    await seedContent();
    console.log('Database seeded successfully!');
    console.log('\n--- Test Accounts ---');
    console.log('Admin: admin@mentalhealthcare.com / admin123');
    console.log('Doctor: doctor@mentalhealthcare.com / doctor123');
    console.log('Healer: healer@mentalhealthcare.com / healer123');
    console.log('User: user@mentalhealthcare.com / user123');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
