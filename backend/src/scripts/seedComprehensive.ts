import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from '../models/User';
import Student from '../models/Student';
import School from '../models/School';
import Section from '../models/Section';
import Task from '../models/Task';
import Progress from '../models/Progress';
import EngagementEvent from '../models/EngagementEvent';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:password@cluster0.mongodb.net/gamification';

// Sample data generators
const grades = ['5', '6', '7', '8', '9'];
const firstNames = [
  'Aarav', 'Aditi', 'Ananya', 'Aditya', 'Anish',
  'Bhavna', 'Bhavesh', 'Chirag', 'Disha', 'Divya',
  'Esha', 'Harsh', 'Ishita', 'Jaya', 'Karan',
  'Katrina', 'Kriti', 'Lakshmi', 'Madhur', 'Manya',
  'Neha', 'Nikhil', 'Nisha', 'Palak', 'Pawan',
  'Priya', 'Rahul', 'Rajeev', 'Rani', 'Ravi',
  'Ridhi', 'Ritik', 'Rohan', 'Sameer', 'Sana',
  'Sanjana', 'Santhosh', 'Sara', 'Shreya', 'Shrishti',
  'Sidhant', 'Simran', 'Siya', 'Sneha', 'Soham',
];

const schools = [
  { name: 'Green Valley High School', city: 'Mumbai', affiliation: 'CBSE' },
  { name: 'Innovation International School', city: 'Delhi', affiliation: 'IB' },
  { name: 'Riverside Academy', city: 'Bangalore', affiliation: 'ICSE' },
  { name: 'Academic Excellence Center', city: 'Pune', affiliation: 'CBSE' },
  { name: 'Future Leaders Academy', city: 'Chennai', affiliation: 'CBSE' },
];

const sections = ['A', 'B', 'C'];

async function seedComprehensive() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await School.deleteMany({});
    await Section.deleteMany({});
    await Task.deleteMany({});
    await Progress.deleteMany({});
    await EngagementEvent.deleteMany({});
    console.log('✓ Cleared existing collections');

    // Create Schools
    console.log('📚 Creating schools...');
    const createdSchools = [];
    for (const schoolData of schools) {
      const school = new School({
        name: schoolData.name,
        city: schoolData.city,
        affiliation: schoolData.affiliation,
        createdAt: new Date(),
      });
      await school.save();
      createdSchools.push(school);
      console.log(`  ✓ Created: ${school.name}`);
    }

    // Create Sections for each school
    console.log('📋 Creating sections...');
    const createdSections = [];
    for (const school of createdSchools) {
      for (const sectionName of sections) {
        for (const grade of grades) {
          const section = new Section({
            name: `${grade}-${sectionName}`,
            grade,
            schoolId: school._id,
            createdAt: new Date(),
          });
          await section.save();
          createdSections.push(section);
        }
      }
    }
    console.log(`  ✓ Created ${createdSections.length} sections`);

    // Create 3 Admin Users (one per school, first two schools)
    console.log('👨‍💼 Creating admin users...');
    const admins = [
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@academia.io',
        password: 'admin123',
        role: 'school_admin',
        schoolId: createdSchools[0]._id,
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@academia.io',
        password: 'admin123',
        role: 'school_admin',
        schoolId: createdSchools[1]._id,
      },
      {
        name: 'Meera Patel',
        email: 'meera.patel@academia.io',
        password: 'admin123',
        role: 'school_admin',
        schoolId: createdSchools[2]._id,
      },
    ];

    for (const adminData of admins) {
      const hashedPassword = await bcryptjs.hash(adminData.password, 10);
      const admin = new User({
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
        schoolId: adminData.schoolId,
        createdAt: new Date(),
      });
      await admin.save();
      console.log(`  ✓ Created admin: ${admin.name} (${admin.email})`);
    }

    // Create 100 Students (20 per grade)
    console.log('👨‍🎓 Creating 100 students...');
    const students = [];
    let studentCount = 0;

    for (const grade of grades) {
      for (let i = 0; i < 20; i++) {
        const school = createdSchools[studentCount % createdSchools.length];
        const section = createdSections.find(
          (s: any) => s.grade === grade && s.schoolId.toString() === school._id.toString()
        ) || createdSections[0];

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const rollNumber = i + 1;

        const student = new Student({
          name: `${firstName} ${lastName}`,
          email: `student${studentCount + 1}@${school.name.toLowerCase().replace(/\s+/g, '')}.edu`,
          password: await bcryptjs.hash('studentpass123', 10),
          role: 'student',
          grade,
          schoolId: school._id,
          sectionId: section._id,
          rollNumber,
          totalPoints: Math.floor(Math.random() * 500),
          level: Math.floor(Math.random() * 10) + 1,
          streak: Math.floor(Math.random() * 7),
          longestStreak: Math.floor(Math.random() * 14),
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
        });
        await student.save();
        students.push(student);
        studentCount++;

        if (studentCount % 10 === 0) {
          console.log(`  ✓ Created ${studentCount} students...`);
        }
      }
    }
    console.log(`  ✓ Total students created: ${students.length}`);

    // Create Sample Tasks/Quests
    console.log('✍️  Creating sample tasks...');
    const taskTitles = [
      'Math Quest: Algebra Basics',
      'Science Challenge: Newton\'s Laws',
      'English Assignment: Essay Writing',
      'History Project: Ancient Civilizations',
      'Geography: World Capitals',
      'Computer Science: Python Fundamentals',
      'Art & Creativity: Digital Design',
      'Social Studies: Government Systems',
      'Physical Education: Fitness Tracker',
      'Language Arts: Reading Comprehension',
    ];

    const createdTasks = [];
    for (const taskTitle of taskTitles) {
      const task = new Task({
        title: taskTitle,
        description: `Complete this ${taskTitle.toLowerCase()} to earn points and boost your level!`,
        pointsReward: Math.floor(Math.random() * 50) + 10,
        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random due date in next 30 days
        createdAt: new Date(),
      });
      await task.save();
      createdTasks.push(task);
    }
    console.log(`  ✓ Created ${createdTasks.length} tasks`);

    // Create Progress records for students
    console.log('📊 Creating progress records...');
    let progressCount = 0;
    for (const student of students) {
      const numTasksToAssign = Math.floor(Math.random() * 6) + 1; // 1-6 tasks per student
      const shuffledTasks = createdTasks.sort(() => 0.5 - Math.random());

      for (let i = 0; i < numTasksToAssign; i++) {
        const task = shuffledTasks[i];
        const status = ['Not Started', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)];
        const pointsEarned = status === 'Completed' ? task.pointsReward : 0;

        const progress = new Progress({
          studentId: student._id,
          taskId: task._id,
          status,
          completedAt: status === 'Completed' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
          pointsEarned,
          attemptCount: Math.floor(Math.random() * 3) + 1,
          timeSpent: Math.floor(Math.random() * 120) + 5, // 5-125 minutes
          createdAt: new Date(),
        });
        await progress.save();
        progressCount++;
      }
    }
    console.log(`  ✓ Created ${progressCount} progress records`);

    // Create Engagement Events for activity tracking
    console.log('📈 Creating engagement events...');
    const eventTypes = ['task_started', 'task_completed', 'milestone_reached', 'streak_maintained', 'level_up'];
    let eventCount = 0;

    for (const student of students.slice(0, 50)) { // Create events for first 50 students
      for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
        const event = new EngagementEvent({
          studentId: student._id,
          eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          metadata: {
            points: Math.floor(Math.random() * 50) + 10,
            taskTitle: createdTasks[Math.floor(Math.random() * createdTasks.length)].title,
          },
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        });
        await event.save();
        eventCount++;
      }
    }
    console.log(`  ✓ Created ${eventCount} engagement events`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ COMPREHENSIVE SEED DATA CREATED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`  • Schools: ${createdSchools.length}`);
    console.log(`  • Admin Users: 3`);
    console.log(`  • Students: ${students.length}`);
    console.log(`  • Sections: ${createdSections.length}`);
    console.log(`  • Tasks: ${createdTasks.length}`);
    console.log(`  • Progress Records: ${progressCount}`);
    console.log(`  • Engagement Events: ${eventCount}`);
    console.log(`\n🔐 Demo Credentials:`);
    console.log(`  Superadmin:`);
    console.log(`    Email: superadmin@academia.io`);
    console.log(`    Password: supersecret`);
    console.log(`\n  School Admins:`);
    admins.forEach((admin) => {
      console.log(`    Email: ${admin.email}`);
      console.log(`    Password: admin123`);
    });
    console.log(`\n  Sample Student:`);
    console.log(`    Email: ${students[0].email}`);
    console.log(`    Password: studentpass123`);
    console.log('\n' + '='.repeat(60) + '\n');

    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  }
}

seedComprehensive();
